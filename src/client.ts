import { ApiError } from "./types.js";
import type { Config, Platform } from "./types.js";
import pkg from "../package.json" with { type: "json" };

// When DEBUG_HTTP=1, log every outgoing HTTP request + incoming response to
// stderr. Useful for the exercise script's --debug-http mode and for ad-hoc
// debugging. No-op in normal operation. Authorization header is never logged.
const DEBUG_HTTP = process.env.DEBUG_HTTP === "1";
const DEBUG_BODY_PREVIEW_CHARS = 5000;

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_BACKOFF_MS = 200;
const DEFAULT_JITTER_RATIO = 0.2;
const DEFAULT_USER_AGENT = `beyond-identity-mcp/${pkg.version}`;

// Methods we'll retry by default. POST/PATCH are non-idempotent and stay
// one-shot unless a caller explicitly opts in via `retryNonIdempotent`.
const IDEMPOTENT_METHODS = new Set(["GET", "HEAD", "PUT", "DELETE"]);

function realSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Retry-After per RFC 9110: either a non-negative integer (seconds) or an
// HTTP-date. Returns delay in ms, or null if the header is absent/malformed.
function parseRetryAfter(value: string | null): number | null {
  if (value === null) return null;
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const asNum = Number(trimmed);
  if (Number.isFinite(asNum) && asNum >= 0) {
    return asNum * 1000;
  }
  const asDate = Date.parse(trimmed);
  if (!Number.isNaN(asDate)) {
    return Math.max(0, asDate - Date.now());
  }
  return null;
}

function logRequest(
  method: string,
  url: string,
  body: string | undefined,
  attempt: number,
  maxRetries: number,
): void {
  const tag = attempt === 0 ? "" : ` (retry ${attempt}/${maxRetries})`;
  process.stderr.write(`[http]${tag} → ${method} ${url}\n`);
  if (body) {
    process.stderr.write(
      `[http]   body: ${body.slice(0, DEBUG_BODY_PREVIEW_CHARS)}${body.length > DEBUG_BODY_PREVIEW_CHARS ? " …(truncated)" : ""}\n`,
    );
  }
}

function logResponse(status: number, body: unknown): void {
  process.stderr.write(`[http] ← ${status}\n`);
  const preview = typeof body === "string"
    ? body
    : JSON.stringify(body);
  if (preview && preview.length > 0) {
    process.stderr.write(
      `[http]   body: ${preview.slice(0, DEBUG_BODY_PREVIEW_CHARS)}${preview.length > DEBUG_BODY_PREVIEW_CHARS ? " …(truncated)" : ""}\n`,
    );
  }
}

export interface ApiClientOptions {
  /** Per-request timeout in milliseconds. Default 30s; env `BI_HTTP_TIMEOUT_MS` overrides. */
  timeoutMs?: number;
  /** Maximum retry attempts after the initial request. 0 disables retries. Default 3. */
  maxRetries?: number;
  /** Base delay for exponential backoff in ms. Default 200. Effective delay: base * 2^attempt ± jitter. */
  baseBackoffMs?: number;
  /** Jitter ratio applied to backoff. Default 0.2 (±20%). */
  jitterRatio?: number;
  /** Sleep implementation. Injectable so tests can fast-forward through backoff waits. */
  sleep?: (ms: number) => Promise<void>;
  /** User-Agent string. Defaults to `beyond-identity-mcp/<pkg.version>`. */
  userAgent?: string;
}

export interface RequestOptions {
  pathParams?: Record<string, string>;
  queryParams?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  /**
   * Opt-in for POST/PATCH retries on transient errors. Most BI write
   * endpoints are NOT idempotent (creating a realm twice = two realms), so
   * this defaults off. Set to true only when the spec marks the endpoint
   * as idempotent or the operation is safe to repeat.
   */
  retryNonIdempotent?: boolean;
}

export class ApiClient {
  private baseUrl: string;
  private token: string;
  private tenantId: string;
  private platform: Platform;
  private timeoutMs: number;
  private maxRetries: number;
  private baseBackoffMs: number;
  private jitterRatio: number;
  private sleep: (ms: number) => Promise<void>;
  private userAgent: string;

  constructor(config: Config, options?: ApiClientOptions) {
    this.baseUrl = config.baseUrl;
    this.token = config.apiToken;
    this.tenantId = config.tenantId;
    this.platform = config.platform;

    const envTimeoutRaw = process.env.BI_HTTP_TIMEOUT_MS;
    const envTimeout = envTimeoutRaw !== undefined ? Number(envTimeoutRaw) : NaN;
    const envTimeoutValid = Number.isFinite(envTimeout) && envTimeout > 0;
    this.timeoutMs =
      options?.timeoutMs ??
      (envTimeoutValid ? envTimeout : DEFAULT_TIMEOUT_MS);

    this.maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.baseBackoffMs = options?.baseBackoffMs ?? DEFAULT_BASE_BACKOFF_MS;
    this.jitterRatio = options?.jitterRatio ?? DEFAULT_JITTER_RATIO;
    this.sleep = options?.sleep ?? realSleep;
    this.userAgent = options?.userAgent ?? DEFAULT_USER_AGENT;
  }

  async request(
    method: string,
    pathTemplate: string,
    options?: RequestOptions,
  ): Promise<unknown> {
    let path = pathTemplate;

    // For v1: inject tenant_id from config. URL-encode for consistency with
    // other path params, and replaceAll so duplicate placeholders all fill.
    if (this.platform === "v1") {
      path = path.replaceAll("{tenant_id}", encodeURIComponent(this.tenantId));
    }

    // Substitute remaining path params
    if (options?.pathParams) {
      for (const [key, value] of Object.entries(options.pathParams)) {
        path = path.replaceAll(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Build URL with query params
    const url = new URL(path, this.baseUrl);
    if (options?.queryParams) {
      for (const [key, value] of Object.entries(options.queryParams)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
      "User-Agent": this.userAgent,
    };

    const baseFetchOptions: RequestInit = { method, headers };
    if (
      options?.body !== undefined &&
      (method === "POST" || method === "PATCH" || method === "PUT")
    ) {
      baseFetchOptions.body = JSON.stringify(options.body);
    }

    const methodUpper = method.toUpperCase();
    const retryEligible =
      IDEMPOTENT_METHODS.has(methodUpper) ||
      options?.retryNonIdempotent === true;

    const urlStr = url.toString();
    let attempt = 0;

    // Retry loop. We make up to `maxRetries + 1` total attempts.
    while (true) {
      const controller = new AbortController();
      const timeoutHandle = setTimeout(
        () => controller.abort(),
        this.timeoutMs,
      );

      if (DEBUG_HTTP) {
        logRequest(
          method,
          urlStr,
          baseFetchOptions.body as string | undefined,
          attempt,
          this.maxRetries,
        );
      }

      let response: Response | undefined;
      let thrownError: unknown;
      try {
        response = await fetch(urlStr, {
          ...baseFetchOptions,
          signal: controller.signal,
        });
      } catch (err) {
        thrownError = err;
      } finally {
        clearTimeout(timeoutHandle);
      }

      // ── Transport-level error path (network failure or timeout) ────────────
      if (response === undefined) {
        const isAbort =
          thrownError instanceof Error && thrownError.name === "AbortError";
        const isNetworkError = thrownError instanceof TypeError;

        if (
          retryEligible &&
          attempt < this.maxRetries &&
          (isAbort || isNetworkError)
        ) {
          await this.sleep(this.computeBackoff(attempt));
          attempt++;
          continue;
        }

        // Final attempt failed. Translate timeouts into a clear error;
        // propagate everything else untouched (preserves original semantics
        // and instanceof checks like `err instanceof TypeError`).
        if (isAbort) {
          throw new Error(
            `HTTP request to ${urlStr} timed out after ${this.timeoutMs}ms`,
          );
        }
        throw thrownError;
      }

      // ── Response-level retry decision ──────────────────────────────────────
      const status = response.status;
      const isRetriableStatus =
        status === 429 || (status >= 500 && status !== 501);

      if (retryEligible && attempt < this.maxRetries && isRetriableStatus) {
        // Honor Retry-After for 429 and 503 when present; else expo-backoff.
        let backoffMs = this.computeBackoff(attempt);
        if (status === 429 || status === 503) {
          const retryAfter = parseRetryAfter(
            response.headers.get("retry-after"),
          );
          if (retryAfter !== null) {
            backoffMs = retryAfter;
          }
        }
        // Drain and discard the response body so the connection can be reused
        // by the next attempt. Ignore errors — best-effort cleanup.
        try {
          await response.text();
        } catch {
          // ignore
        }
        await this.sleep(backoffMs);
        attempt++;
        continue;
      }

      // ── Final response — parse body and return / throw ─────────────────────
      let responseBody: unknown;
      const contentType = response.headers.get("content-type") ?? "";
      // Accept application/json and any RFC 6839 structured-syntax JSON suffix
      // (e.g. application/scim+json, application/problem+json). Without this,
      // SCIM responses fall through to text() and downstream handlers double-
      // encode them when they JSON.stringify the "result".
      if (/^application\/(?:[^;]+\+)?json(?:;|$)/i.test(contentType)) {
        responseBody = await response.json();
      } else {
        responseBody = await response.text();
      }

      if (DEBUG_HTTP) {
        logResponse(response.status, responseBody);
      }

      if (!response.ok) {
        const errorBody = responseBody as Record<string, unknown> | string;
        let code = "UNKNOWN";
        let message = `HTTP ${response.status}`;
        let details: unknown;

        if (typeof errorBody === "object" && errorBody !== null) {
          code = String(errorBody.code ?? errorBody.error ?? "UNKNOWN");
          message = String(
            errorBody.message ?? errorBody.error_description ?? `HTTP ${response.status}`,
          );
          details = errorBody;
        } else if (typeof errorBody === "string" && errorBody.length > 0) {
          message = errorBody;
        }

        throw new ApiError(response.status, code, message, details);
      }

      return responseBody;
    }
  }

  // Exponential backoff with symmetric jitter. base * 2^attempt ± jitterRatio.
  private computeBackoff(attempt: number): number {
    const base = this.baseBackoffMs * Math.pow(2, attempt);
    const jitter = base * this.jitterRatio * (Math.random() * 2 - 1);
    return Math.max(0, base + jitter);
  }
}

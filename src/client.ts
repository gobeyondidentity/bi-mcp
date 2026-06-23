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
// Upper bound on `Retry-After` honoring. If the server requests a longer
// wait, we surface the error rather than parking the process — a server
// asking for >60s isn't asking for retry, it's asking for backoff.
const DEFAULT_MAX_RETRY_AFTER_MS = 60_000;
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

// 5xx-except-501 and 429 are the transient-error statuses we retry.
function isRetryableStatus(status: number): boolean {
  return status === 429 || (status >= 500 && status !== 501);
}

// Parse the response body using the same JSON-suffix detection the original
// implementation used (RFC 6839: application/scim+json, application/problem+json).
async function readBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (/^application\/(?:[^;]+\+)?json(?:;|$)/i.test(contentType)) {
    return response.json();
  }
  return response.text();
}

function buildApiError(status: number, body: unknown): ApiError {
  const errorBody = body as Record<string, unknown> | string;
  let code = "UNKNOWN";
  let message = `HTTP ${status}`;
  let details: unknown;
  if (typeof errorBody === "object" && errorBody !== null) {
    code = String(errorBody.code ?? errorBody.error ?? "UNKNOWN");
    message = String(
      errorBody.message ?? errorBody.error_description ?? `HTTP ${status}`,
    );
    details = errorBody;
  } else if (typeof errorBody === "string" && errorBody.length > 0) {
    message = errorBody;
  }
  return new ApiError(status, code, message, details);
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
  /**
   * Per-attempt end-to-end timeout in milliseconds. Default 30s; env
   * `BI_HTTP_TIMEOUT_MS` overrides. Covers connect + headers + body parsing
   * — not just `fetch()` resolution.
   */
  timeoutMs?: number;
  /** Maximum retry attempts after the initial request. 0 disables retries. Default 3. */
  maxRetries?: number;
  /** Base delay for exponential backoff in ms. Default 200. Effective delay: base * 2^attempt ± jitter. */
  baseBackoffMs?: number;
  /** Jitter ratio applied to backoff. Default 0.2 (±20%). */
  jitterRatio?: number;
  /**
   * Upper bound on `Retry-After` honoring in ms. Default 60s. If a server
   * requests a longer wait, the retry is skipped and the response error is
   * surfaced to the caller.
   */
  maxRetryAfterMs?: number;
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
  private maxRetryAfterMs: number;
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
    this.maxRetryAfterMs = options?.maxRetryAfterMs ?? DEFAULT_MAX_RETRY_AFTER_MS;
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

    // Retry loop. We make up to `maxRetries + 1` total attempts. The
    // AbortController for each attempt stays live across fetch + body
    // drain (if retrying) + body parse (if final), so the timeout covers
    // the full attempt lifecycle — not just `fetch()` resolution.
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

      try {
        let response: Response;
        try {
          response = await fetch(urlStr, {
            ...baseFetchOptions,
            signal: controller.signal,
          });
        } catch (err) {
          // ── Transport-level error (network failure, fetch-time abort) ──
          const isAbort = err instanceof Error && err.name === "AbortError";
          const isNetworkError = err instanceof TypeError;
          if (
            retryEligible &&
            attempt < this.maxRetries &&
            (isAbort || isNetworkError)
          ) {
            await this.sleep(this.computeBackoff(attempt));
            attempt++;
            continue;
          }
          // Final attempt failed. AbortError → clear timeout message via
          // the outer catch; everything else propagates untouched
          // (preserves `err instanceof TypeError` for downstream callers).
          if (isAbort) throw err;
          throw err;
        }

        // ── Response-level retry decision ────────────────────────────────
        const status = response.status;
        const retryable = isRetryableStatus(status);

        if (retryEligible && attempt < this.maxRetries && retryable) {
          let backoffMs = this.computeBackoff(attempt);
          let skipRetry = false;
          if (status === 429 || status === 503) {
            const retryAfter = parseRetryAfter(
              response.headers.get("retry-after"),
            );
            if (retryAfter !== null) {
              if (retryAfter > this.maxRetryAfterMs) {
                // Server is asking for a longer wait than we'll honor.
                // Skip retry; fall through to the final response path so
                // the caller sees the 429/503 with full context.
                skipRetry = true;
              } else {
                backoffMs = retryAfter;
              }
            }
          }

          if (!skipRetry) {
            // Drain and discard the body so the connection can be reused.
            // Still under the AbortController, so a hung body drain trips
            // the timeout the same as a hung fetch.
            try {
              await response.text();
            } catch {
              // ignore — best-effort cleanup
            }
            await this.sleep(backoffMs);
            attempt++;
            continue;
          }
        }

        // ── Final response — parse body and return / throw ───────────────
        const responseBody = await readBody(response);

        if (DEBUG_HTTP) {
          logResponse(response.status, responseBody);
        }

        if (!response.ok) {
          throw buildApiError(response.status, responseBody);
        }

        return responseBody;
      } catch (err) {
        // Centralized AbortError translation. Catches an abort that fires
        // during fetch, body drain, body parse — anywhere inside the try.
        if (err instanceof Error && err.name === "AbortError") {
          throw new Error(
            `HTTP request to ${urlStr} timed out after ${this.timeoutMs}ms`,
            { cause: err },
          );
        }
        throw err;
      } finally {
        clearTimeout(timeoutHandle);
      }
    }
  }

  // Exponential backoff with symmetric jitter. base * 2^attempt ± jitterRatio.
  private computeBackoff(attempt: number): number {
    const base = this.baseBackoffMs * Math.pow(2, attempt);
    const jitter = base * this.jitterRatio * (Math.random() * 2 - 1);
    return Math.max(0, base + jitter);
  }
}

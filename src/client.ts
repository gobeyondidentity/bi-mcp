import { ApiError } from "./types.js";
import type { Config, Platform } from "./types.js";

// When DEBUG_HTTP=1, log every outgoing HTTP request + incoming response to
// stderr. Useful for the exercise script's --debug-http mode and for ad-hoc
// debugging. No-op in normal operation. Authorization header is never logged.
const DEBUG_HTTP = process.env.DEBUG_HTTP === "1";
const DEBUG_BODY_PREVIEW_CHARS = 5000;

function logRequest(method: string, url: string, body: string | undefined): void {
  process.stderr.write(`[http] → ${method} ${url}\n`);
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

export class ApiClient {
  private baseUrl: string;
  private token: string;
  private tenantId: string;
  private platform: Platform;

  constructor(config: Config) {
    this.baseUrl = config.baseUrl;
    this.token = config.apiToken;
    this.tenantId = config.tenantId;
    this.platform = config.platform;
  }

  async request(
    method: string,
    pathTemplate: string,
    options?: {
      pathParams?: Record<string, string>;
      queryParams?: Record<string, string | number | boolean | undefined>;
      body?: unknown;
    },
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
    };

    const fetchOptions: RequestInit = { method, headers };
    if (options?.body !== undefined && (method === "POST" || method === "PATCH" || method === "PUT")) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    if (DEBUG_HTTP) {
      logRequest(method, url.toString(), fetchOptions.body as string | undefined);
    }

    const response = await fetch(url.toString(), fetchOptions);

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

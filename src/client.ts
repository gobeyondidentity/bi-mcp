import { ApiError } from "./types.js";
import type { Config, Platform } from "./types.js";

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

    // For v1: inject tenant_id from config
    if (this.platform === "v1") {
      path = path.replace("{tenant_id}", this.tenantId);
    }

    // Substitute remaining path params
    if (options?.pathParams) {
      for (const [key, value] of Object.entries(options.pathParams)) {
        path = path.replace(`{${key}}`, encodeURIComponent(value));
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

    const response = await fetch(url.toString(), fetchOptions);

    let responseBody: unknown;
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
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

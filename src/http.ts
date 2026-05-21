import http from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { buildConfig } from "./config.js";
import { createServer } from "./server.js";

export interface HttpServerOptions {
  port: number;
  host?: string;
  /** Server-side override of the API base URL (applies to every session). */
  baseUrl?: string;
  /** Default region when the request doesn't supply X-BI-Region. */
  defaultRegion?: string;
  /** HTTP path the MCP endpoint is served at. Defaults to "/mcp". */
  path?: string;
}

interface SessionEntry {
  transport: StreamableHTTPServerTransport;
}

const SESSION_ID_HEADER = "mcp-session-id";
const REGION_HEADER = "x-bi-region";

function bearerToken(req: IncomingMessage): string | undefined {
  const auth = req.headers["authorization"];
  if (typeof auth !== "string") return undefined;
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : undefined;
}

function send(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function getHeader(
  req: IncomingMessage,
  name: string,
): string | undefined {
  const value = req.headers[name];
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

/**
 * Start the streamable-HTTP transport. Each incoming session gets its own
 * McpServer + StreamableHTTPServerTransport pair bound to the Bearer token
 * supplied on the initialize request.
 *
 * Resolves with the underlying http.Server once it's listening; rejects if
 * the listen() call fails.
 */
export async function startHttpServer(
  opts: HttpServerOptions,
): Promise<http.Server> {
  const path = opts.path ?? "/mcp";
  const defaultRegion = opts.defaultRegion ?? "US";
  const baseUrl = opts.baseUrl;

  const sessions = new Map<string, SessionEntry>();

  const httpServer = http.createServer(async (req, res) => {
    let url: URL;
    try {
      url = new URL(
        req.url || "/",
        `http://${req.headers.host || "localhost"}`,
      );
    } catch {
      send(res, 400, {
        error: "bad_request",
        message: "Could not parse request URL.",
      });
      return;
    }
    if (url.pathname !== path) {
      send(res, 404, { error: "not_found" });
      return;
    }

    const sessionId = getHeader(req, SESSION_ID_HEADER);

    // ── Existing session ─────────────────────────────────────────────
    if (sessionId) {
      const entry = sessions.get(sessionId);
      if (!entry) {
        send(res, 404, {
          error: "unknown_session",
          message: "Unknown Mcp-Session-Id; reinitialize.",
        });
        return;
      }
      try {
        await entry.transport.handleRequest(req, res);
      } catch (err) {
        console.error(
          `[beyond-identity-mcp] Session ${sessionId} error:`,
          err,
        );
        if (!res.headersSent) {
          send(res, 500, { error: "internal_error" });
        }
      }
      return;
    }

    // ── No session ID ────────────────────────────────────────────────
    // Only POST can establish a new session; everything else is a client bug.
    if (req.method !== "POST") {
      send(res, 400, {
        error: "missing_session",
        message:
          "Mcp-Session-Id header required for non-initialization requests.",
      });
      return;
    }

    const token = bearerToken(req);
    if (!token) {
      res.setHeader("WWW-Authenticate", "Bearer");
      send(res, 401, {
        error: "missing_token",
        message: "Authorization: Bearer <api-token> header required.",
      });
      return;
    }

    const region = getHeader(req, REGION_HEADER) ?? defaultRegion;

    let config;
    try {
      config = buildConfig({ apiToken: token, region, baseUrl });
    } catch (err) {
      send(res, 401, {
        error: "invalid_token",
        message: err instanceof Error ? err.message : String(err),
      });
      return;
    }

    const server = createServer(config);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sid) => {
        sessions.set(sid, { transport });
        console.error(
          `[beyond-identity-mcp] Session ${sid} started (platform=${config.platform}, region=${config.region}, tenant=${config.tenantId})`,
        );
      },
    });

    transport.onclose = () => {
      const sid = transport.sessionId;
      if (sid) {
        sessions.delete(sid);
        console.error(`[beyond-identity-mcp] Session ${sid} closed`);
      }
    };

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res);
    } catch (err) {
      console.error("[beyond-identity-mcp] Initialize failed:", err);
      if (!res.headersSent) {
        send(res, 500, { error: "initialize_failed" });
      }
    }
  });

  return new Promise((resolve, reject) => {
    httpServer.once("error", reject);
    httpServer.listen(opts.port, opts.host, () => {
      const host = opts.host || "0.0.0.0";
      console.error(
        `[beyond-identity-mcp] HTTP transport listening on http://${host}:${opts.port}${path}`,
      );
      resolve(httpServer);
    });
  });
}

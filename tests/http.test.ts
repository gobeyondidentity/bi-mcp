import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import type http from "node:http";
import type { AddressInfo } from "node:net";
import { startHttpServer } from "../src/http.js";
import { fakeJwt } from "./helpers.js";

let server: http.Server;
let baseUrl: string;
let mcpUrl: string;

before(async () => {
  server = await startHttpServer({ port: 0, host: "127.0.0.1" });
  const addr = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${addr.port}`;
  mcpUrl = `${baseUrl}/mcp`;
});

after(() => {
  server.close();
});

describe("HTTP transport — request routing & error paths", () => {
  test("GET on unknown path → 404", async () => {
    const res = await fetch(`${baseUrl}/not-mcp`);
    assert.equal(res.status, 404);
    const body = (await res.json()) as { error: string };
    assert.equal(body.error, "not_found");
  });

  test("GET /mcp without Mcp-Session-Id → 400 missing_session", async () => {
    const res = await fetch(mcpUrl);
    assert.equal(res.status, 400);
    const body = (await res.json()) as { error: string };
    assert.equal(body.error, "missing_session");
  });

  test("POST /mcp without Authorization → 401 + WWW-Authenticate", async () => {
    const res = await fetch(mcpUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: "initialize", id: 1 }),
    });
    assert.equal(res.status, 401);
    assert.equal(res.headers.get("www-authenticate"), "Bearer");
    const body = (await res.json()) as { error: string };
    assert.equal(body.error, "missing_token");
  });

  test("POST /mcp with malformed Bearer → 401 invalid_token", async () => {
    const res = await fetch(mcpUrl, {
      method: "POST",
      headers: {
        "Authorization": "Bearer not-a-jwt",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jsonrpc: "2.0", method: "initialize", id: 1 }),
    });
    assert.equal(res.status, 401);
    const body = (await res.json()) as { error: string; message: string };
    assert.equal(body.error, "invalid_token");
    assert.match(body.message, /JWT/);
  });

  test("POST /mcp with valid-shape Bearer but missing claims → 401", async () => {
    const jwt = fakeJwt({ irrelevant: "claims" });
    const res = await fetch(mcpUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jsonrpc: "2.0", method: "initialize", id: 1 }),
    });
    assert.equal(res.status, 401);
    const body = (await res.json()) as { error: string; message: string };
    assert.equal(body.error, "invalid_token");
    assert.match(body.message, /bi_t|sub/);
  });

  test("POST /mcp with unknown Mcp-Session-Id → 404 unknown_session", async () => {
    const res = await fetch(mcpUrl, {
      method: "POST",
      headers: {
        "Mcp-Session-Id": "made-up-session",
        "Content-Type": "application/json",
      },
      body: "{}",
    });
    assert.equal(res.status, 404);
    const body = (await res.json()) as { error: string };
    assert.equal(body.error, "unknown_session");
  });
});

describe("HTTP transport — initialize happy path", () => {
  async function initializeSession(jwt: string, region?: string): Promise<{
    status: number;
    sessionId: string | null;
    body: string;
  }> {
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${jwt}`,
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream",
    };
    if (region) headers["X-BI-Region"] = region;

    const res = await fetch(mcpUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "initialize",
        id: 1,
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "node-test", version: "1.0.0" },
        },
      }),
    });
    return {
      status: res.status,
      sessionId: res.headers.get("mcp-session-id"),
      // Drain the body so the connection cleans up
      body: await res.text(),
    };
  }

  test("v1 JWT → initialize returns 200 + Mcp-Session-Id header", async () => {
    const jwt = fakeJwt({ bi_t: "init-test-v1" });
    const result = await initializeSession(jwt);
    assert.equal(result.status, 200);
    assert.ok(
      result.sessionId && result.sessionId.length > 0,
      `Expected Mcp-Session-Id header, got: ${result.sessionId}`,
    );
  });

  test("v0 JWT → initialize returns 200 + Mcp-Session-Id header", async () => {
    const jwt = fakeJwt({ sub: "init-test-v0" });
    const result = await initializeSession(jwt);
    assert.equal(result.status, 200);
    assert.ok(result.sessionId && result.sessionId.length > 0);
  });

  test("two concurrent sessions get distinct session IDs", async () => {
    const jwt1 = fakeJwt({ bi_t: "tenant-a" });
    const jwt2 = fakeJwt({ bi_t: "tenant-b" });
    const [s1, s2] = await Promise.all([
      initializeSession(jwt1),
      initializeSession(jwt2),
    ]);
    assert.equal(s1.status, 200);
    assert.equal(s2.status, 200);
    assert.ok(s1.sessionId);
    assert.ok(s2.sessionId);
    assert.notEqual(s1.sessionId, s2.sessionId);
  });

  test("EU region header → initialize succeeds (region wired through)", async () => {
    const jwt = fakeJwt({ bi_t: "eu-tenant" });
    const result = await initializeSession(jwt, "EU");
    assert.equal(result.status, 200);
    assert.ok(result.sessionId);
  });
});

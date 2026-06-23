import { test } from "node:test";
import assert from "node:assert/strict";
import { ApiClient } from "../src/client.js";
import { ApiError } from "../src/types.js";
import type { Config } from "../src/types.js";
import { jsonResponse } from "./helpers/integration.js";

const V1_CONFIG: Config = {
  apiToken: "test-token",
  tenantId: "tenant-xyz",
  platform: "v1",
  region: "US",
  baseUrl: "https://api.example.com",
};

const V0_CONFIG: Config = {
  apiToken: "v0-token",
  tenantId: "v0-tenant",
  platform: "v0",
  region: "US",
  baseUrl: "https://api.byndid.example",
};

interface CapturedCall {
  url: string;
  init: RequestInit;
}

function installFetchStub(response: Response): {
  calls: CapturedCall[];
  restore: () => void;
} {
  const calls: CapturedCall[] = [];
  const original = globalThis.fetch;
  globalThis.fetch = (async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => {
    calls.push({ url: String(input), init: init ?? {} });
    return response.clone();
  }) as typeof fetch;
  return {
    calls,
    restore: () => {
      globalThis.fetch = original;
    },
  };
}

test("v1 client injects tenant_id into the path", async () => {
  const stub = installFetchStub(jsonResponse({ ok: true }));
  try {
    const client = new ApiClient(V1_CONFIG);
    await client.request("GET", "/v1/tenants/{tenant_id}/realms");
    assert.equal(stub.calls.length, 1);
    assert.equal(
      stub.calls[0].url,
      "https://api.example.com/v1/tenants/tenant-xyz/realms",
    );
  } finally {
    stub.restore();
  }
});

test("v1 client ignores agent-supplied tenant_id in pathParams (cross-tenant guard)", async () => {
  // The client overwrites {tenant_id} with the JWT-derived tenantId BEFORE
  // honoring caller pathParams, so even if a tool somehow tried to inject
  // a foreign tenant_id, the URL stays pinned to the real tenant.
  const stub = installFetchStub(jsonResponse({}));
  try {
    const client = new ApiClient({ ...V1_CONFIG, tenantId: "real-tenant-A" });
    await client.request("GET", "/v1/tenants/{tenant_id}/realms", {
      pathParams: { tenant_id: "spoofed-tenant-B" },
    });
    assert.equal(
      stub.calls[0].url,
      "https://api.example.com/v1/tenants/real-tenant-A/realms",
    );
    assert.doesNotMatch(stub.calls[0].url, /spoofed-tenant-B/);
  } finally {
    stub.restore();
  }
});

test("v1 client surfaces agent-supplied tenant_id in queryParams as-is (server-side defense expected)", async () => {
  // No BI v1 endpoint advertises tenant_id as a query param today, but if a
  // future tool somehow passed one, the client would forward it. The server
  // is the authority on tenant identity (it derives it from the bearer
  // token, not query strings) — this test documents the contract: query
  // params from agents arrive unmodified, and the server must enforce.
  const stub = installFetchStub(jsonResponse({}));
  try {
    const client = new ApiClient({ ...V1_CONFIG, tenantId: "real-tenant-A" });
    await client.request("GET", "/v1/tenants/{tenant_id}/realms", {
      queryParams: { tenant_id: "spoofed-tenant-B" },
    });
    // Path is still pinned to the real tenant
    assert.match(stub.calls[0].url, /\/v1\/tenants\/real-tenant-A\/realms/);
    // Query param is forwarded — server must ignore / 403 / 404
    const u = new URL(stub.calls[0].url);
    assert.equal(u.searchParams.get("tenant_id"), "spoofed-tenant-B");
  } finally {
    stub.restore();
  }
});

test("v1 client URL-encodes the injected tenant_id", async () => {
  // Tenant IDs from real JWTs are UUIDs (no special chars), but a defensive
  // encode-on-injection guarantees a malformed tenant claim can't escape its
  // path segment. Reuse the standard config but with a tenant ID containing
  // chars that need encoding.
  const stub = installFetchStub(jsonResponse({}));
  try {
    const client = new ApiClient({ ...V1_CONFIG, tenantId: "a/b c?d" });
    await client.request("GET", "/v1/tenants/{tenant_id}/realms");
    assert.equal(
      stub.calls[0].url,
      "https://api.example.com/v1/tenants/a%2Fb%20c%3Fd/realms",
    );
  } finally {
    stub.restore();
  }
});

test("v1 client fills ALL occurrences of a duplicated placeholder (replaceAll)", async () => {
  // Synthetic path with duplicate placeholders to guard against a regression
  // back to first-match replace, which would leave the second {tenant_id}/{realm_id}
  // as a literal in the outgoing URL.
  const stub = installFetchStub(jsonResponse({}));
  try {
    const client = new ApiClient(V1_CONFIG);
    await client.request(
      "GET",
      "/v1/tenants/{tenant_id}/realms/{realm_id}/clone/{tenant_id}/from/{realm_id}",
      { pathParams: { realm_id: "r-1" } },
    );
    assert.equal(
      stub.calls[0].url,
      "https://api.example.com/v1/tenants/tenant-xyz/realms/r-1/clone/tenant-xyz/from/r-1",
    );
  } finally {
    stub.restore();
  }
});

test("v0 client leaves {tenant_id} placeholders untouched", async () => {
  // v0 paths never use {tenant_id} in practice, but this asserts the
  // platform branch in client.ts that skips tenant injection on v0. The literal
  // `{` and `}` get URL-encoded by `new URL()` to `%7B`/`%7D`.
  const stub = installFetchStub(jsonResponse({}));
  try {
    const client = new ApiClient(V0_CONFIG);
    await client.request("GET", "/synthetic/{tenant_id}/things");
    assert.equal(
      stub.calls[0].url,
      "https://api.byndid.example/synthetic/%7Btenant_id%7D/things",
    );
  } finally {
    stub.restore();
  }
});

test("pathParams are substituted and URL-encoded", async () => {
  const stub = installFetchStub(jsonResponse({}));
  try {
    const client = new ApiClient(V1_CONFIG);
    await client.request(
      "GET",
      "/v1/tenants/{tenant_id}/realms/{realm_id}/identities/{identity_id}",
      {
        pathParams: { realm_id: "r 1", identity_id: "user@example.com" },
      },
    );
    assert.equal(
      stub.calls[0].url,
      "https://api.example.com/v1/tenants/tenant-xyz/realms/r%201/identities/user%40example.com",
    );
  } finally {
    stub.restore();
  }
});

test("queryParams are serialized; undefined values omitted", async () => {
  const stub = installFetchStub(jsonResponse({}));
  try {
    const client = new ApiClient(V1_CONFIG);
    await client.request("GET", "/v1/tenants/{tenant_id}/realms", {
      queryParams: {
        page_size: 50,
        active: true,
        cursor: undefined,
        name: "test",
      },
    });
    const url = new URL(stub.calls[0].url);
    assert.equal(url.searchParams.get("page_size"), "50");
    assert.equal(url.searchParams.get("active"), "true");
    assert.equal(url.searchParams.get("name"), "test");
    assert.equal(url.searchParams.has("cursor"), false);
  } finally {
    stub.restore();
  }
});

test("Authorization and Content-Type headers are set on every request", async () => {
  const stub = installFetchStub(jsonResponse({}));
  try {
    const client = new ApiClient(V1_CONFIG);
    await client.request("GET", "/v1/tenants/{tenant_id}/realms");
    const headers = stub.calls[0].init.headers as Record<string, string>;
    assert.equal(headers.Authorization, "Bearer test-token");
    assert.equal(headers["Content-Type"], "application/json");
  } finally {
    stub.restore();
  }
});

test("body is serialized for POST", async () => {
  const stub = installFetchStub(jsonResponse({}));
  try {
    const client = new ApiClient(V1_CONFIG);
    await client.request("POST", "/v1/tenants/{tenant_id}/realms", {
      body: { display_name: "Prod" },
    });
    assert.equal(stub.calls[0].init.method, "POST");
    assert.equal(stub.calls[0].init.body, JSON.stringify({ display_name: "Prod" }));
  } finally {
    stub.restore();
  }
});

test("body is serialized for PATCH and PUT", async () => {
  for (const method of ["PATCH", "PUT"]) {
    const stub = installFetchStub(jsonResponse({}));
    try {
      const client = new ApiClient(V1_CONFIG);
      await client.request(method, "/v1/tenants/{tenant_id}/realms/x", {
        body: { display_name: "Updated" },
      });
      assert.equal(stub.calls[0].init.method, method);
      assert.equal(
        stub.calls[0].init.body,
        JSON.stringify({ display_name: "Updated" }),
      );
    } finally {
      stub.restore();
    }
  }
});

test("body is omitted for GET", async () => {
  const stub = installFetchStub(jsonResponse({}));
  try {
    const client = new ApiClient(V1_CONFIG);
    await client.request("GET", "/v1/tenants/{tenant_id}/realms", {
      body: { ignored: true },
    });
    assert.equal(stub.calls[0].init.body, undefined);
  } finally {
    stub.restore();
  }
});

test("body is omitted for DELETE", async () => {
  const stub = installFetchStub(jsonResponse({}));
  try {
    const client = new ApiClient(V1_CONFIG);
    await client.request("DELETE", "/v1/tenants/{tenant_id}/realms/x");
    assert.equal(stub.calls[0].init.method, "DELETE");
    assert.equal(stub.calls[0].init.body, undefined);
  } finally {
    stub.restore();
  }
});

test("successful JSON response is returned as parsed JSON", async () => {
  const stub = installFetchStub(jsonResponse({ id: "r1", name: "Prod" }));
  try {
    const client = new ApiClient(V1_CONFIG);
    const result = await client.request("GET", "/v1/tenants/{tenant_id}/realms");
    assert.deepEqual(result, { id: "r1", name: "Prod" });
  } finally {
    stub.restore();
  }
});

test("application/scim+json response is parsed as JSON (not double-encoded as a string)", async () => {
  // Real SCIM servers respond with `Content-Type: application/scim+json` per
  // RFC 7644 §3.1. Without the RFC 6839 `+json` suffix match, the body falls
  // through to text() and downstream MCP handlers double-encode it when they
  // JSON.stringify the result.
  const stub = installFetchStub(
    new Response(JSON.stringify({ id: "u1", userName: "alice" }), {
      status: 200,
      headers: { "content-type": "application/scim+json; charset=utf-8" },
    }),
  );
  try {
    const client = new ApiClient(V1_CONFIG);
    const result = await client.request("POST", "/scim/v2/Users");
    assert.deepEqual(result, { id: "u1", userName: "alice" });
  } finally {
    stub.restore();
  }
});

test("application/problem+json is also parsed as JSON", async () => {
  // Another RFC 6839 suffix — used for problem details (RFC 7807).
  const stub = installFetchStub(
    new Response(JSON.stringify({ type: "about:blank", title: "Bad Request" }), {
      status: 400,
      headers: { "content-type": "application/problem+json" },
    }),
  );
  try {
    const client = new ApiClient(V1_CONFIG);
    await assert.rejects(
      async () => client.request("GET", "/v1/tenants/{tenant_id}/realms"),
      (err: unknown) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.statusCode, 400);
        return true;
      },
    );
  } finally {
    stub.restore();
  }
});

test("4xx response throws ApiError with status, code, message", async () => {
  const stub = installFetchStub(
    new Response(
      JSON.stringify({ code: "INVALID_ARGUMENT", message: "missing realm_id" }),
      { status: 400, headers: { "content-type": "application/json" } },
    ),
  );
  try {
    const client = new ApiClient(V1_CONFIG);
    await assert.rejects(
      async () => client.request("GET", "/v1/tenants/{tenant_id}/realms"),
      (err: unknown) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.statusCode, 400);
        assert.equal(err.code, "INVALID_ARGUMENT");
        assert.equal(err.message, "missing realm_id");
        return true;
      },
    );
  } finally {
    stub.restore();
  }
});

test("5xx response throws ApiError with HTTP <status> fallback message", async () => {
  const stub = installFetchStub(
    new Response("internal", { status: 500, headers: { "content-type": "text/plain" } }),
  );
  try {
    const client = new ApiClient(V1_CONFIG);
    await assert.rejects(
      async () => client.request("GET", "/v1/tenants/{tenant_id}/realms"),
      (err: unknown) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.statusCode, 500);
        assert.equal(err.message, "internal");
        return true;
      },
    );
  } finally {
    stub.restore();
  }
});

test("network-level fetch failure propagates as-is (NOT wrapped in ApiError)", async () => {
  // fetch can throw before any response arrives (DNS, refused connection, abort).
  // After retries are exhausted the original error bubbles up untouched —
  // callers downstream rely on `err instanceof TypeError` to distinguish
  // network errors from API errors. Disable retries here so the test stays
  // fast; the "max retries exhausted" path is covered separately below.
  const original = globalThis.fetch;
  const networkErr = new TypeError("fetch failed: ECONNREFUSED");
  globalThis.fetch = (async () => {
    throw networkErr;
  }) as typeof fetch;
  try {
    const client = new ApiClient(V1_CONFIG, { maxRetries: 0 });
    await assert.rejects(
      async () => client.request("GET", "/v1/tenants/{tenant_id}/realms"),
      (err: unknown) => {
        assert.equal(err, networkErr);
        assert.ok(!(err instanceof ApiError));
        return true;
      },
    );
  } finally {
    globalThis.fetch = original;
  }
});

test("4xx with empty body falls back to 'HTTP <status>' message", async () => {
  const stub = installFetchStub(
    new Response("", { status: 404, headers: { "content-type": "text/plain" } }),
  );
  try {
    const client = new ApiClient(V1_CONFIG);
    await assert.rejects(
      async () => client.request("GET", "/v1/tenants/{tenant_id}/realms/x"),
      (err: unknown) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.statusCode, 404);
        assert.equal(err.code, "UNKNOWN");
        assert.equal(err.message, "HTTP 404");
        return true;
      },
    );
  } finally {
    stub.restore();
  }
});

test("error response with `error` field falls back to that code", async () => {
  const stub = installFetchStub(
    new Response(
      JSON.stringify({ error: "invalid_token", error_description: "token expired" }),
      { status: 401, headers: { "content-type": "application/json" } },
    ),
  );
  try {
    const client = new ApiClient(V1_CONFIG);
    await assert.rejects(
      async () => client.request("GET", "/v1/tenants/{tenant_id}/realms"),
      (err: unknown) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.statusCode, 401);
        assert.equal(err.code, "invalid_token");
        assert.equal(err.message, "token expired");
        return true;
      },
    );
  } finally {
    stub.restore();
  }
});

// ── Retry / timeout / User-Agent ───────────────────────────────────────────
// All retry tests inject `sleep: () => Promise.resolve()` so backoff waits
// don't slow the suite. They still assert the requested backoff *durations*
// via a custom sleep capture where the timing matters (Retry-After).

interface SequencedCall {
  url: string;
  init: RequestInit;
}

function installSequencedFetchStub(
  responders: Array<(() => Response) | (() => Promise<Response>) | (() => never)>,
): { calls: SequencedCall[]; restore: () => void } {
  const calls: SequencedCall[] = [];
  const original = globalThis.fetch;
  let i = 0;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), init: init ?? {} });
    if (i >= responders.length) {
      throw new Error(
        `fetch stub exhausted: call #${i + 1} not configured (only ${responders.length} responders)`,
      );
    }
    return await responders[i++]();
  }) as typeof fetch;
  return { calls, restore: () => { globalThis.fetch = original; } };
}

test("User-Agent header includes the package version", async () => {
  const stub = installFetchStub(jsonResponse({}));
  try {
    const client = new ApiClient(V1_CONFIG);
    await client.request("GET", "/v1/tenants/{tenant_id}/realms");
    const headers = stub.calls[0].init.headers as Record<string, string>;
    assert.match(headers["User-Agent"] ?? "", /^beyond-identity-mcp\/\d+\.\d+\.\d+/);
  } finally {
    stub.restore();
  }
});

test("custom userAgent option overrides the default", async () => {
  const stub = installFetchStub(jsonResponse({}));
  try {
    const client = new ApiClient(V1_CONFIG, { userAgent: "test-agent/9.9.9" });
    await client.request("GET", "/v1/tenants/{tenant_id}/realms");
    const headers = stub.calls[0].init.headers as Record<string, string>;
    assert.equal(headers["User-Agent"], "test-agent/9.9.9");
  } finally {
    stub.restore();
  }
});

test("GET retries on 503 then succeeds", async () => {
  const stub = installSequencedFetchStub([
    () => new Response("svc unavail", { status: 503 }),
    () => new Response("svc unavail", { status: 503 }),
    () => jsonResponse({ ok: true }),
  ]);
  try {
    const client = new ApiClient(V1_CONFIG, {
      sleep: () => Promise.resolve(),
    });
    const result = await client.request("GET", "/v1/tenants/{tenant_id}/realms");
    assert.deepEqual(result, { ok: true });
    assert.equal(stub.calls.length, 3, "expected 2 retries + 1 success = 3 calls");
  } finally {
    stub.restore();
  }
});

test("GET retries on network TypeError then succeeds", async () => {
  let calls = 0;
  const original = globalThis.fetch;
  globalThis.fetch = (async () => {
    calls++;
    if (calls < 3) throw new TypeError("fetch failed: ECONNRESET");
    return jsonResponse({ ok: true });
  }) as typeof fetch;
  try {
    const client = new ApiClient(V1_CONFIG, {
      sleep: () => Promise.resolve(),
    });
    const result = await client.request("GET", "/v1/tenants/{tenant_id}/realms");
    assert.deepEqual(result, { ok: true });
    assert.equal(calls, 3);
  } finally {
    globalThis.fetch = original;
  }
});

test("max retries exhausted on persistent 5xx — final ApiError bubbles up", async () => {
  const stub = installSequencedFetchStub([
    () => new Response("err", { status: 502 }),
    () => new Response("err", { status: 502 }),
    () => new Response("err", { status: 502 }),
    () => new Response("err", { status: 502 }),
  ]);
  try {
    const client = new ApiClient(V1_CONFIG, {
      sleep: () => Promise.resolve(),
    });
    await assert.rejects(
      async () => client.request("GET", "/v1/tenants/{tenant_id}/realms"),
      (err: unknown) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.statusCode, 502);
        return true;
      },
    );
    // 1 initial + 3 retries = 4 attempts at default maxRetries=3
    assert.equal(stub.calls.length, 4);
  } finally {
    stub.restore();
  }
});

test("POST stays one-shot on 503 (no retry) by default", async () => {
  const stub = installSequencedFetchStub([
    () => new Response("svc unavail", { status: 503 }),
  ]);
  try {
    const client = new ApiClient(V1_CONFIG, {
      sleep: () => Promise.resolve(),
    });
    await assert.rejects(
      async () => client.request("POST", "/v1/tenants/{tenant_id}/realms", {
        body: { display_name: "x" },
      }),
      (err: unknown) => err instanceof ApiError && err.statusCode === 503,
    );
    assert.equal(stub.calls.length, 1, "POST must NOT retry by default");
  } finally {
    stub.restore();
  }
});

test("POST retries when retryNonIdempotent=true", async () => {
  const stub = installSequencedFetchStub([
    () => new Response("err", { status: 503 }),
    () => jsonResponse({ id: "ok" }),
  ]);
  try {
    const client = new ApiClient(V1_CONFIG, {
      sleep: () => Promise.resolve(),
    });
    const result = await client.request(
      "POST",
      "/v1/tenants/{tenant_id}/realms",
      { body: { display_name: "x" }, retryNonIdempotent: true },
    );
    assert.deepEqual(result, { id: "ok" });
    assert.equal(stub.calls.length, 2);
  } finally {
    stub.restore();
  }
});

test("501 Not Implemented is NOT retried (only 5xx-except-501 retry)", async () => {
  const stub = installSequencedFetchStub([
    () => new Response("not implemented", { status: 501 }),
  ]);
  try {
    const client = new ApiClient(V1_CONFIG, {
      sleep: () => Promise.resolve(),
    });
    await assert.rejects(
      async () => client.request("GET", "/v1/tenants/{tenant_id}/realms"),
      (err: unknown) => err instanceof ApiError && err.statusCode === 501,
    );
    assert.equal(stub.calls.length, 1, "501 must NOT retry");
  } finally {
    stub.restore();
  }
});

test("4xx (other than 429) is NOT retried", async () => {
  // 400/401/403/404 are all "your request is wrong" — retrying changes nothing.
  for (const status of [400, 401, 403, 404]) {
    const stub = installSequencedFetchStub([
      () => new Response("err", { status }),
    ]);
    try {
      const client = new ApiClient(V1_CONFIG, {
        sleep: () => Promise.resolve(),
      });
      await assert.rejects(
        async () => client.request("GET", "/v1/tenants/{tenant_id}/realms"),
        (err: unknown) => err instanceof ApiError && err.statusCode === status,
      );
      assert.equal(stub.calls.length, 1, `status ${status} must NOT retry`);
    } finally {
      stub.restore();
    }
  }
});

test("429 with Retry-After: <seconds> waits the requested duration before retrying", async () => {
  const sleeps: number[] = [];
  const stub = installSequencedFetchStub([
    () =>
      new Response("rate limited", {
        status: 429,
        headers: { "retry-after": "2" },
      }),
    () => jsonResponse({ ok: true }),
  ]);
  try {
    const client = new ApiClient(V1_CONFIG, {
      sleep: (ms) => {
        sleeps.push(ms);
        return Promise.resolve();
      },
    });
    const result = await client.request("GET", "/v1/tenants/{tenant_id}/realms");
    assert.deepEqual(result, { ok: true });
    assert.equal(sleeps.length, 1);
    assert.equal(sleeps[0], 2000, "Retry-After: 2 → 2000ms sleep");
  } finally {
    stub.restore();
  }
});

test("429 without Retry-After falls back to exponential backoff", async () => {
  const sleeps: number[] = [];
  const stub = installSequencedFetchStub([
    () => new Response("rate limited", { status: 429 }),
    () => jsonResponse({ ok: true }),
  ]);
  try {
    const client = new ApiClient(V1_CONFIG, {
      baseBackoffMs: 100,
      jitterRatio: 0, // disable jitter so the value is deterministic
      sleep: (ms) => { sleeps.push(ms); return Promise.resolve(); },
    });
    await client.request("GET", "/v1/tenants/{tenant_id}/realms");
    assert.equal(sleeps.length, 1);
    // First retry: 100 * 2^0 = 100ms (with zero jitter)
    assert.equal(sleeps[0], 100);
  } finally {
    stub.restore();
  }
});

test("exponential backoff grows base * 2^attempt across retries (jitter off)", async () => {
  const sleeps: number[] = [];
  const stub = installSequencedFetchStub([
    () => new Response("err", { status: 503 }),
    () => new Response("err", { status: 503 }),
    () => new Response("err", { status: 503 }),
    () => jsonResponse({ ok: true }),
  ]);
  try {
    const client = new ApiClient(V1_CONFIG, {
      baseBackoffMs: 100,
      jitterRatio: 0,
      sleep: (ms) => { sleeps.push(ms); return Promise.resolve(); },
    });
    await client.request("GET", "/v1/tenants/{tenant_id}/realms");
    assert.deepEqual(sleeps, [100, 200, 400]);
  } finally {
    stub.restore();
  }
});

test("timeout fires after configured ms when fetch hangs", async () => {
  // Stub fetch that hangs until its abort signal fires, then throws the
  // AbortError that runtime fetch would normally produce.
  const original = globalThis.fetch;
  globalThis.fetch = ((_input: RequestInfo | URL, init?: RequestInit) =>
    new Promise((_resolve, reject) => {
      const signal = init?.signal;
      if (!signal) return; // never resolve — test will time out the harness
      const onAbort = () => {
        const err = new Error("aborted");
        err.name = "AbortError";
        reject(err);
      };
      if (signal.aborted) onAbort();
      else signal.addEventListener("abort", onAbort);
    })) as typeof fetch;
  try {
    const client = new ApiClient(V1_CONFIG, {
      timeoutMs: 50,
      maxRetries: 0,
      sleep: () => Promise.resolve(),
    });
    const start = Date.now();
    await assert.rejects(
      async () => client.request("GET", "/v1/tenants/{tenant_id}/realms"),
      (err: unknown) => {
        assert.ok(err instanceof Error);
        assert.match(err.message, /timed out after 50ms/);
        return true;
      },
    );
    const elapsed = Date.now() - start;
    assert.ok(elapsed >= 40, `expected ≥40ms, got ${elapsed}ms`);
    assert.ok(elapsed < 1000, `expected timeout to fire fast, got ${elapsed}ms`);
  } finally {
    globalThis.fetch = original;
  }
});

test("timeout error counts as retriable for idempotent methods", async () => {
  // First call hangs (will be aborted). Second call succeeds.
  let callIdx = 0;
  const original = globalThis.fetch;
  globalThis.fetch = ((_input: RequestInfo | URL, init?: RequestInit) => {
    callIdx++;
    if (callIdx === 1) {
      return new Promise((_resolve, reject) => {
        const signal = init?.signal;
        if (!signal) return;
        signal.addEventListener("abort", () => {
          const err = new Error("aborted");
          err.name = "AbortError";
          reject(err);
        });
      });
    }
    return Promise.resolve(jsonResponse({ ok: true }));
  }) as typeof fetch;
  try {
    const client = new ApiClient(V1_CONFIG, {
      timeoutMs: 30,
      maxRetries: 2,
      sleep: () => Promise.resolve(),
    });
    const result = await client.request("GET", "/v1/tenants/{tenant_id}/realms");
    assert.deepEqual(result, { ok: true });
    assert.equal(callIdx, 2);
  } finally {
    globalThis.fetch = original;
  }
});

test("BI_HTTP_TIMEOUT_MS env var overrides default timeout", async () => {
  const originalEnv = process.env.BI_HTTP_TIMEOUT_MS;
  process.env.BI_HTTP_TIMEOUT_MS = "123";
  try {
    const original = globalThis.fetch;
    globalThis.fetch = ((_input: RequestInfo | URL, init?: RequestInit) =>
      new Promise((_resolve, reject) => {
        const signal = init?.signal;
        signal?.addEventListener("abort", () => {
          const err = new Error("aborted");
          err.name = "AbortError";
          reject(err);
        });
      })) as typeof fetch;
    try {
      const client = new ApiClient(V1_CONFIG, {
        maxRetries: 0,
        sleep: () => Promise.resolve(),
      });
      await assert.rejects(
        async () => client.request("GET", "/v1/tenants/{tenant_id}/realms"),
        (err: unknown) =>
          err instanceof Error && /timed out after 123ms/.test(err.message),
      );
    } finally {
      globalThis.fetch = original;
    }
  } finally {
    if (originalEnv === undefined) delete process.env.BI_HTTP_TIMEOUT_MS;
    else process.env.BI_HTTP_TIMEOUT_MS = originalEnv;
  }
});

// ── End-to-end timeout coverage ────────────────────────────────────────────
// The AbortController must stay live through body parsing. A server that
// sends headers quickly but then trickles the body must still trip the
// configured timeout — otherwise the docstring's "per-request timeout" lies.

function buildHangingBodyResponse(signal: AbortSignal): Response {
  // ReadableStream that never enqueues data and never closes. The fetch
  // implementation surfaces the signal abort by erroring the stream, which
  // surfaces as an AbortError when the caller awaits `.text()` / `.json()`.
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const onAbort = () => {
        controller.error(
          Object.assign(new Error("aborted"), { name: "AbortError" }),
        );
      };
      if (signal.aborted) onAbort();
      else signal.addEventListener("abort", onAbort);
    },
  });
  return new Response(stream, {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

test("timeout fires while parsing a slow-trickle body", async () => {
  // fetch resolves fast (headers in), body never completes. The timeout
  // must trip body parsing, not just the headers wait.
  const original = globalThis.fetch;
  globalThis.fetch = ((_input: RequestInfo | URL, init?: RequestInit) => {
    const signal = init?.signal;
    if (!signal) throw new Error("test: signal missing");
    return Promise.resolve(buildHangingBodyResponse(signal));
  }) as typeof fetch;
  try {
    const client = new ApiClient(V1_CONFIG, {
      timeoutMs: 50,
      maxRetries: 0,
      sleep: () => Promise.resolve(),
    });
    const start = Date.now();
    await assert.rejects(
      async () => client.request("GET", "/v1/tenants/{tenant_id}/realms"),
      (err: unknown) => {
        assert.ok(err instanceof Error);
        assert.match(err.message, /timed out after 50ms/);
        return true;
      },
    );
    const elapsed = Date.now() - start;
    assert.ok(elapsed >= 40, `expected ≥40ms, got ${elapsed}ms`);
    assert.ok(elapsed < 1000, `expected fast timeout, got ${elapsed}ms`);
  } finally {
    globalThis.fetch = original;
  }
});

test("timeout fires during body drain before retry — surfaces on FIRST attempt", async () => {
  // 503 with a hanging body. We attempt to drain before retrying; the
  // drain must trip the per-attempt timeout AND surface the timeout
  // immediately rather than silently retrying through more aborted
  // drains. With maxRetries=3 and a 50ms timeout, silent-retry would
  // take ~200ms; correct behavior fails at ~50ms (one attempt's budget).
  let fetchCalls = 0;
  const original = globalThis.fetch;
  globalThis.fetch = ((_input: RequestInfo | URL, init?: RequestInit) => {
    fetchCalls++;
    const signal = init?.signal;
    if (!signal) throw new Error("test: signal missing");
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const onAbort = () =>
          controller.error(
            Object.assign(new Error("aborted"), { name: "AbortError" }),
          );
        if (signal.aborted) onAbort();
        else signal.addEventListener("abort", onAbort);
      },
    });
    return Promise.resolve(
      new Response(stream, {
        status: 503,
        headers: { "content-type": "text/plain" },
      }),
    );
  }) as typeof fetch;
  try {
    const client = new ApiClient(V1_CONFIG, {
      timeoutMs: 50,
      maxRetries: 3,
      sleep: () => Promise.resolve(),
    });
    const start = Date.now();
    await assert.rejects(
      async () => client.request("GET", "/v1/tenants/{tenant_id}/realms"),
      (err: unknown) => {
        assert.ok(err instanceof Error);
        assert.match(err.message, /timed out after 50ms/);
        return true;
      },
    );
    const elapsed = Date.now() - start;
    // Tight bound — should be ~50ms for one attempt's timeout, not
    // ~200ms (4 attempts × 50ms). Allow generous CI slack (4x = 200ms)
    // but reject the silent-retry regression (which would land ≥200ms
    // and grow with maxRetries).
    assert.ok(elapsed < 180, `expected fast failure on first attempt, got ${elapsed}ms`);
    // Only one fetch should have happened — drain abort must short-circuit
    // the retry, not consume the retry budget.
    assert.equal(fetchCalls, 1, "drain timeout must surface immediately, not retry");
  } finally {
    globalThis.fetch = original;
  }
});

test("timeout error chains the original AbortError as its cause", async () => {
  // The wrapped timeout Error exposes the original abort via err.cause so
  // a debugger sees the underlying signal cancellation, not just our
  // friendly message.
  const original = globalThis.fetch;
  globalThis.fetch = ((_input: RequestInfo | URL, init?: RequestInit) =>
    new Promise((_resolve, reject) => {
      const signal = init?.signal;
      signal?.addEventListener("abort", () => {
        const err = new Error("aborted");
        err.name = "AbortError";
        reject(err);
      });
    })) as typeof fetch;
  try {
    const client = new ApiClient(V1_CONFIG, {
      timeoutMs: 30,
      maxRetries: 0,
      sleep: () => Promise.resolve(),
    });
    await assert.rejects(
      async () => client.request("GET", "/v1/tenants/{tenant_id}/realms"),
      (err: unknown) => {
        assert.ok(err instanceof Error);
        assert.match(err.message, /timed out/);
        assert.ok(err.cause instanceof Error, "cause should be an Error");
        assert.equal(
          (err.cause as Error).name,
          "AbortError",
          "cause should be the original AbortError",
        );
        return true;
      },
    );
  } finally {
    globalThis.fetch = original;
  }
});

// ── Retry-After cap ────────────────────────────────────────────────────────
// A server can request an arbitrary wait via Retry-After. We honor it only
// up to maxRetryAfterMs (default 60s); beyond that we skip the retry and
// surface the error so the caller knows to back off entirely.

test("Retry-After within cap is honored", async () => {
  // Regression guard — the default cap (60s) should not affect a 2s wait.
  const sleeps: number[] = [];
  const stub = installSequencedFetchStub([
    () =>
      new Response("rate limited", {
        status: 429,
        headers: { "retry-after": "2" },
      }),
    () => jsonResponse({ ok: true }),
  ]);
  try {
    const client = new ApiClient(V1_CONFIG, {
      sleep: (ms) => { sleeps.push(ms); return Promise.resolve(); },
    });
    const result = await client.request("GET", "/v1/tenants/{tenant_id}/realms");
    assert.deepEqual(result, { ok: true });
    assert.deepEqual(sleeps, [2000]);
  } finally {
    stub.restore();
  }
});

test("Retry-After exceeding default cap aborts retry", async () => {
  // Retry-After: 999 → 999000ms > default 60000ms cap. Client must NOT
  // sleep that long; it must surface the 429 instead.
  const sleeps: number[] = [];
  const stub = installSequencedFetchStub([
    () =>
      new Response(
        JSON.stringify({ code: "RATE_LIMITED", message: "slow down" }),
        {
          status: 429,
          headers: {
            "content-type": "application/json",
            "retry-after": "999",
          },
        },
      ),
  ]);
  try {
    const client = new ApiClient(V1_CONFIG, {
      sleep: (ms) => { sleeps.push(ms); return Promise.resolve(); },
    });
    await assert.rejects(
      async () => client.request("GET", "/v1/tenants/{tenant_id}/realms"),
      (err: unknown) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.statusCode, 429);
        return true;
      },
    );
    assert.equal(stub.calls.length, 1, "must not retry when Retry-After exceeds cap");
    assert.equal(sleeps.length, 0, "must not sleep when cap exceeded");
  } finally {
    stub.restore();
  }
});

test("Retry-After honored up to custom maxRetryAfterMs", async () => {
  // Bump the cap to 2_000_000ms (~33min). A 999s wait now fits and
  // becomes a real sleep — locks the option in place.
  const sleeps: number[] = [];
  const stub = installSequencedFetchStub([
    () =>
      new Response("rate limited", {
        status: 429,
        headers: { "retry-after": "999" },
      }),
    () => jsonResponse({ ok: true }),
  ]);
  try {
    const client = new ApiClient(V1_CONFIG, {
      maxRetryAfterMs: 2_000_000,
      sleep: (ms) => { sleeps.push(ms); return Promise.resolve(); },
    });
    const result = await client.request("GET", "/v1/tenants/{tenant_id}/realms");
    assert.deepEqual(result, { ok: true });
    assert.deepEqual(sleeps, [999_000]);
  } finally {
    stub.restore();
  }
});

test("Retry-After cap also applies to 503", async () => {
  // 503 with an abusive Retry-After should bail the same as 429.
  const stub = installSequencedFetchStub([
    () =>
      new Response("svc unavail", {
        status: 503,
        headers: { "retry-after": "86400" },
      }),
  ]);
  try {
    const client = new ApiClient(V1_CONFIG, {
      sleep: () => Promise.resolve(),
    });
    await assert.rejects(
      async () => client.request("GET", "/v1/tenants/{tenant_id}/realms"),
      (err: unknown) => err instanceof ApiError && err.statusCode === 503,
    );
    assert.equal(stub.calls.length, 1);
  } finally {
    stub.restore();
  }
});

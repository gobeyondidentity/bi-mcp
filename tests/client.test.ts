import { test } from "node:test";
import assert from "node:assert/strict";
import { ApiClient } from "../src/client.js";
import { ApiError } from "../src/types.js";
import type { Config } from "../src/types.js";

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

type FetchStub = (response: Response) => CapturedCall[];

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

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
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
  // The client doesn't catch these — they bubble up to the caller untouched.
  const original = globalThis.fetch;
  const networkErr = new TypeError("fetch failed: ECONNREFUSED");
  globalThis.fetch = (async () => {
    throw networkErr;
  }) as typeof fetch;
  try {
    const client = new ApiClient(V1_CONFIG);
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

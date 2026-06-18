import { test } from "node:test";
import assert from "node:assert/strict";
import { loadConfig } from "../src/config.js";

function base64url(s: string): string {
  return Buffer.from(s, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function makeJwt(payload: Record<string, unknown>): string {
  // Signature is never verified — any string after the second dot is fine.
  return `header.${base64url(JSON.stringify(payload))}.sig`;
}

function withEnv<T>(
  vars: Record<string, string | undefined>,
  fn: () => T,
): T {
  const snapshot: Record<string, string | undefined> = {};
  for (const k of Object.keys(vars)) snapshot[k] = process.env[k];
  for (const [k, v] of Object.entries(vars)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  try {
    return fn();
  } finally {
    for (const [k, v] of Object.entries(snapshot)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

test("missing API_KEY throws a clear error", () => {
  withEnv({ API_KEY: undefined, REGION: undefined, BASE_URL: undefined }, () => {
    assert.throws(() => loadConfig(), /API_KEY environment variable is required/);
  });
});

test("non-JWT-shaped token throws", () => {
  withEnv({ API_KEY: "not-a-jwt", REGION: undefined, BASE_URL: undefined }, () => {
    assert.throws(() => loadConfig(), /expected a JWT with 3 segments/);
  });
});

test("bad base64 payload throws JSON-parse error", () => {
  // Three segments but invalid base64 content in the middle that decodes to gibberish.
  withEnv({ API_KEY: "h.!!!!!.s", REGION: undefined, BASE_URL: undefined }, () => {
    assert.throws(() => loadConfig(), /payload is not valid (base64|JSON)/);
  });
});

test("payload that decodes but isn't a JSON object throws", () => {
  // A bare number (typeof === "number") trips the explicit object check.
  // Note: arrays are typeof "object" in JS so they slip past this check and
  // get caught by the downstream "missing expected claims" error instead.
  const numberPayload = base64url(JSON.stringify(42));
  withEnv(
    { API_KEY: `h.${numberPayload}.s`, REGION: undefined, BASE_URL: undefined },
    () => {
      assert.throws(() => loadConfig(), /payload is not a JSON object/);
    },
  );
});

test("payload missing both bi_t and sub claims throws", () => {
  withEnv(
    { API_KEY: makeJwt({ iss: "foo" }), REGION: undefined, BASE_URL: undefined },
    () => {
      assert.throws(() => loadConfig(), /missing expected claims/);
    },
  );
});

test("bi_t claim → v1 platform, tenantId = bi_t, US baseUrl", () => {
  withEnv(
    {
      API_KEY: makeJwt({ bi_t: "tenant-abc" }),
      REGION: undefined,
      BASE_URL: undefined,
    },
    () => {
      const cfg = loadConfig();
      assert.equal(cfg.platform, "v1");
      assert.equal(cfg.tenantId, "tenant-abc");
      assert.equal(cfg.region, "US");
      assert.equal(cfg.baseUrl, "https://api-us.beyondidentity.com");
    },
  );
});

test("only sub claim → v0 platform, tenantId = sub, US baseUrl", () => {
  withEnv(
    {
      API_KEY: makeJwt({ sub: "v0-tenant" }),
      REGION: undefined,
      BASE_URL: undefined,
    },
    () => {
      const cfg = loadConfig();
      assert.equal(cfg.platform, "v0");
      assert.equal(cfg.tenantId, "v0-tenant");
      assert.equal(cfg.baseUrl, "https://api.byndid.com");
    },
  );
});

test("bi_t takes precedence over sub", () => {
  withEnv(
    {
      API_KEY: makeJwt({ bi_t: "t1", sub: "different" }),
      REGION: undefined,
      BASE_URL: undefined,
    },
    () => {
      const cfg = loadConfig();
      assert.equal(cfg.platform, "v1");
      assert.equal(cfg.tenantId, "t1");
    },
  );
});

test("REGION=EU switches to EU host on v1", () => {
  withEnv(
    {
      API_KEY: makeJwt({ bi_t: "t" }),
      REGION: "EU",
      BASE_URL: undefined,
    },
    () => {
      assert.equal(loadConfig().baseUrl, "https://api-eu.beyondidentity.com");
    },
  );
});

test("REGION=EU switches to EU host on v0", () => {
  withEnv(
    {
      API_KEY: makeJwt({ sub: "t" }),
      REGION: "EU",
      BASE_URL: undefined,
    },
    () => {
      assert.equal(loadConfig().baseUrl, "https://api-eu.byndid.com");
    },
  );
});

test("REGION is case-insensitive (eu works)", () => {
  withEnv(
    {
      API_KEY: makeJwt({ bi_t: "t" }),
      REGION: "eu",
      BASE_URL: undefined,
    },
    () => {
      assert.equal(loadConfig().region, "EU");
    },
  );
});

test("invalid REGION throws", () => {
  withEnv(
    {
      API_KEY: makeJwt({ bi_t: "t" }),
      REGION: "APAC",
      BASE_URL: undefined,
    },
    () => {
      assert.throws(() => loadConfig(), /REGION must be "US" or "EU"/);
    },
  );
});

test("BASE_URL env var overrides the platform/region default", () => {
  withEnv(
    {
      API_KEY: makeJwt({ sub: "t" }),
      REGION: undefined,
      BASE_URL: "https://api.rolling.byndid.run",
    },
    () => {
      assert.equal(loadConfig().baseUrl, "https://api.rolling.byndid.run");
    },
  );
});

test("expired JWT (past exp claim, beyond skew window) throws with a clear message", () => {
  // 5 minutes ago — comfortably past the JWT_EXPIRY_SKEW_MS tolerance in
  // src/config.ts. If the constant ever grows past 5 minutes, widen this.
  const pastExp = Math.floor(Date.now() / 1000) - 300;
  withEnv(
    {
      API_KEY: makeJwt({ bi_t: "t", exp: pastExp }),
      REGION: undefined,
      BASE_URL: undefined,
    },
    () => {
      assert.throws(() => loadConfig(), /API_KEY JWT expired on /);
    },
  );
});

test("JWT expiring within the skew window is accepted", () => {
  // 30 seconds ago — inside the JWT_EXPIRY_SKEW_MS tolerance (60s) in
  // src/config.ts, so startup must NOT throw. Lets the BI API be the
  // authority on actual token validity instead of the local wall clock.
  const recentExp = Math.floor(Date.now() / 1000) - 30;
  withEnv(
    {
      API_KEY: makeJwt({ bi_t: "t", exp: recentExp }),
      REGION: undefined,
      BASE_URL: undefined,
    },
    () => {
      assert.doesNotThrow(() => loadConfig());
    },
  );
});

test("JWT with future exp is accepted", () => {
  const futureExp = Math.floor(Date.now() / 1000) + 3600; // one hour from now
  withEnv(
    {
      API_KEY: makeJwt({ bi_t: "t", exp: futureExp }),
      REGION: undefined,
      BASE_URL: undefined,
    },
    () => {
      const cfg = loadConfig();
      assert.equal(cfg.platform, "v1");
    },
  );
});

test("JWT without exp claim is accepted (don't break on tokens that omit it)", () => {
  withEnv(
    {
      API_KEY: makeJwt({ bi_t: "t" }),
      REGION: undefined,
      BASE_URL: undefined,
    },
    () => {
      const cfg = loadConfig();
      assert.equal(cfg.tenantId, "t");
    },
  );
});

test("non-number exp claim is ignored (defensive)", () => {
  // Spec-noncompliant tokens with string exp shouldn't crash startup.
  withEnv(
    {
      API_KEY: makeJwt({ bi_t: "t", exp: "not-a-number" }),
      REGION: undefined,
      BASE_URL: undefined,
    },
    () => {
      assert.doesNotThrow(() => loadConfig());
    },
  );
});

test("empty bi_t falls back to sub", () => {
  withEnv(
    {
      API_KEY: makeJwt({ bi_t: "", sub: "fallback-tenant" }),
      REGION: undefined,
      BASE_URL: undefined,
    },
    () => {
      const cfg = loadConfig();
      assert.equal(cfg.platform, "v0");
      assert.equal(cfg.tenantId, "fallback-tenant");
    },
  );
});

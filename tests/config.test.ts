import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { buildConfig, loadConfig } from "../src/config.js";
import { fakeJwt } from "./helpers.js";

describe("buildConfig — platform detection", () => {
  test("v0 JWT (sub claim, no bi_t) → v0 platform + byndid.com URL", () => {
    const jwt = fakeJwt({ sub: "tenant-v0-123" });
    const config = buildConfig({ apiToken: jwt });
    assert.equal(config.platform, "v0");
    assert.equal(config.tenantId, "tenant-v0-123");
    assert.equal(config.region, "US");
    assert.equal(config.baseUrl, "https://api.byndid.com");
  });

  test("v1 JWT (bi_t claim) → v1 platform + beyondidentity.com URL", () => {
    const jwt = fakeJwt({ bi_t: "tenant-v1-abc", sub: "user-1" });
    const config = buildConfig({ apiToken: jwt });
    assert.equal(config.platform, "v1");
    assert.equal(config.tenantId, "tenant-v1-abc");
    assert.equal(config.baseUrl, "https://api-us.beyondidentity.com");
  });

  test("bi_t takes precedence over sub when both present", () => {
    const jwt = fakeJwt({ bi_t: "v1-tenant", sub: "v0-tenant" });
    const config = buildConfig({ apiToken: jwt });
    assert.equal(config.platform, "v1");
    assert.equal(config.tenantId, "v1-tenant");
  });
});

describe("buildConfig — region routing", () => {
  test("EU region → EU URL for v1", () => {
    const jwt = fakeJwt({ bi_t: "x" });
    const config = buildConfig({ apiToken: jwt, region: "EU" });
    assert.equal(config.region, "EU");
    assert.equal(config.baseUrl, "https://api-eu.beyondidentity.com");
  });

  test("EU region → EU URL for v0", () => {
    const jwt = fakeJwt({ sub: "x" });
    const config = buildConfig({ apiToken: jwt, region: "EU" });
    assert.equal(config.baseUrl, "https://api-eu.byndid.com");
  });

  test("region input is case-insensitive", () => {
    const jwt = fakeJwt({ bi_t: "x" });
    const config = buildConfig({ apiToken: jwt, region: "eu" });
    assert.equal(config.region, "EU");
  });

  test("baseUrl override wins over derived URL", () => {
    const jwt = fakeJwt({ bi_t: "x" });
    const config = buildConfig({
      apiToken: jwt,
      region: "EU",
      baseUrl: "http://localhost:8021",
    });
    assert.equal(config.baseUrl, "http://localhost:8021");
  });
});

describe("buildConfig — validation", () => {
  test("missing apiToken throws", () => {
    assert.throws(() => buildConfig({ apiToken: "" }), /required/i);
  });

  test("JWT with wrong segment count throws", () => {
    assert.throws(
      () => buildConfig({ apiToken: "not.a.jwt.extra" }),
      /3 segments/,
    );
  });

  test("JWT with non-JSON payload throws", () => {
    // Valid base64url segments but the middle one decodes to garbage
    const bad = `${Buffer.from("{}").toString("base64url")}.${Buffer.from("not json").toString("base64url")}.sig`;
    assert.throws(
      () => buildConfig({ apiToken: bad }),
      /not valid JSON|invalid JWT/,
    );
  });

  test("JWT missing bi_t and sub throws", () => {
    const jwt = fakeJwt({ random: "field" });
    assert.throws(() => buildConfig({ apiToken: jwt }), /bi_t.*sub/);
  });

  test("unknown region throws", () => {
    const jwt = fakeJwt({ bi_t: "x" });
    assert.throws(
      () => buildConfig({ apiToken: jwt, region: "ASIA" }),
      /US.*EU|EU.*US/,
    );
  });
});

describe("loadConfig — env wrapper", () => {
  test("throws if API_KEY not set", () => {
    const saved = process.env.API_KEY;
    delete process.env.API_KEY;
    try {
      assert.throws(() => loadConfig(), /API_KEY.*required/);
    } finally {
      if (saved !== undefined) process.env.API_KEY = saved;
    }
  });

  test("reads API_KEY + REGION + BASE_URL from env", () => {
    const saved = {
      key: process.env.API_KEY,
      region: process.env.REGION,
      baseUrl: process.env.BASE_URL,
    };
    process.env.API_KEY = fakeJwt({ bi_t: "from-env" });
    process.env.REGION = "EU";
    process.env.BASE_URL = "https://override.example.com";
    try {
      const config = loadConfig();
      assert.equal(config.tenantId, "from-env");
      assert.equal(config.region, "EU");
      assert.equal(config.baseUrl, "https://override.example.com");
    } finally {
      // Restore env so other test files aren't perturbed
      if (saved.key === undefined) delete process.env.API_KEY;
      else process.env.API_KEY = saved.key;
      if (saved.region === undefined) delete process.env.REGION;
      else process.env.REGION = saved.region;
      if (saved.baseUrl === undefined) delete process.env.BASE_URL;
      else process.env.BASE_URL = saved.baseUrl;
    }
  });
});

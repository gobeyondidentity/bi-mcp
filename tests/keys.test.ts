import { test } from "node:test";
import assert from "node:assert/strict";
import { KEY_PATTERN, sanitizeKey } from "../src/keys.js";

test("KEY_PATTERN accepts the alphabet of allowed chars", () => {
  assert.match("plain", KEY_PATTERN);
  assert.match("snake_case", KEY_PATTERN);
  assert.match("kebab-case", KEY_PATTERN);
  assert.match("with.dot", KEY_PATTERN);
  assert.match("MixedCase123", KEY_PATTERN);
  assert.match("a", KEY_PATTERN);
});

test("KEY_PATTERN rejects disallowed characters", () => {
  assert.doesNotMatch("with:colon", KEY_PATTERN);
  assert.doesNotMatch("$ref", KEY_PATTERN);
  assert.doesNotMatch("with space", KEY_PATTERN);
  assert.doesNotMatch("with/slash", KEY_PATTERN);
  assert.doesNotMatch("with@at", KEY_PATTERN);
});

test("KEY_PATTERN rejects empty and over-64-char keys", () => {
  assert.doesNotMatch("", KEY_PATTERN);
  assert.doesNotMatch("a".repeat(65), KEY_PATTERN);
  assert.match("a".repeat(64), KEY_PATTERN);
});

test("sanitizeKey is identity for already-conforming keys", () => {
  assert.equal(sanitizeKey("plain"), "plain");
  assert.equal(sanitizeKey("snake_case"), "snake_case");
  assert.equal(sanitizeKey("kebab-case"), "kebab-case");
  assert.equal(sanitizeKey("with.dot"), "with.dot");
  assert.equal(sanitizeKey("MixedCase123"), "MixedCase123");
});

test("sanitizeKey replaces each disallowed char with underscore", () => {
  assert.equal(sanitizeKey("with:colon"), "with_colon");
  assert.equal(sanitizeKey("$ref"), "_ref");
  assert.equal(sanitizeKey("a:b:c"), "a_b_c");
  assert.equal(sanitizeKey("with space"), "with_space");
  assert.equal(sanitizeKey("with/slash"), "with_slash");
});

test("sanitizeKey truncates to 64 chars", () => {
  const long = "a".repeat(100);
  assert.equal(sanitizeKey(long).length, 64);

  const longWithViolations = "urn:" + "x".repeat(100);
  const result = sanitizeKey(longWithViolations);
  assert.equal(result.length, 64);
  assert.equal(result.startsWith("urn_"), true);
});

test("sanitizeKey is idempotent", () => {
  const inputs = [
    "plain",
    "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User",
    "urn:scim:schemas:extension:byndid:1.0:Group",
    "$ref",
    "a".repeat(80),
  ];
  for (const input of inputs) {
    const once = sanitizeKey(input);
    const twice = sanitizeKey(once);
    assert.equal(once, twice, `not idempotent for ${input}`);
  }
});

test("sanitizeKey produces results that pass KEY_PATTERN", () => {
  const inputs = [
    "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User",
    "urn:scim:schemas:extension:byndid:1.0:Group",
    "$ref",
    "x".repeat(100),
    "$:!@#%^&*()",
    "a".repeat(64),
  ];
  for (const input of inputs) {
    assert.match(sanitizeKey(input), KEY_PATTERN, `failed for ${input}`);
  }
});

test("sanitizeKey output for known SCIM URN keys (regression for committed remap)", () => {
  assert.equal(
    sanitizeKey("urn:ietf:params:scim:schemas:extension:enterprise:2.0:User"),
    "urn_ietf_params_scim_schemas_extension_enterprise_2.0_User",
  );
  assert.equal(
    sanitizeKey("urn:scim:schemas:extension:byndid:1.0:Group"),
    "urn_scim_schemas_extension_byndid_1.0_Group",
  );
  assert.equal(sanitizeKey("$ref"), "_ref");
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { searchTools } from "../src/search.js";
import type { ToolMeta } from "../src/types.js";

const REGISTRY: ToolMeta[] = [
  {
    name: "list_identities",
    description: "List identities for a realm",
    tags: ["Identities"],
    method: "GET",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/identities",
  },
  {
    name: "create_identity",
    description: "Create a new identity",
    tags: ["Identities"],
    method: "POST",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/identities",
  },
  {
    name: "delete_identity",
    description: "Delete an identity",
    tags: ["Identities"],
    method: "DELETE",
    pathTemplate:
      "/v1/tenants/{tenant_id}/realms/{realm_id}/identities/{identity_id}",
  },
  {
    name: "add_group_members",
    description: "Add members to a group",
    tags: ["Groups"],
    method: "POST",
    pathTemplate:
      "/v1/tenants/{tenant_id}/realms/{realm_id}/groups/{group_id}/members",
  },
  {
    name: "list_groups",
    description: "List groups for a realm",
    tags: ["Groups"],
    method: "GET",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/groups",
  },
  {
    name: "list_applications",
    description: "List applications for a realm",
    tags: ["Applications"],
    method: "GET",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/applications",
  },
  {
    name: "create_sso_config",
    description: "Create a new SSO config",
    tags: ["SSO Configs"],
    method: "POST",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/sso-configs",
  },
  {
    name: "revoke_credential",
    description: "Revoke a credential",
    tags: ["Credentials"],
    method: "DELETE",
    pathTemplate:
      "/v1/tenants/{tenant_id}/realms/{realm_id}/identities/{identity_id}/credentials/{credential_id}",
  },
];

test("returns empty array for empty / whitespace / stop-word-only query", () => {
  assert.deepEqual(searchTools(REGISTRY, ""), []);
  assert.deepEqual(searchTools(REGISTRY, "   "), []);
  assert.deepEqual(searchTools(REGISTRY, "the a an to"), []);
});

test("finds tools by exact name-segment match", () => {
  const results = searchTools(REGISTRY, "groups");
  const names = results.map((r) => r.name);
  assert.ok(names.includes("list_groups"));
  assert.ok(names.includes("add_group_members"));
});

test("user query is expanded via synonyms to match identity tools", () => {
  const results = searchTools(REGISTRY, "user");
  const names = results.map((r) => r.name);
  // `user` → ["identity", "user"] expansion should surface identity tools
  assert.ok(
    names.includes("list_identities") ||
      names.includes("create_identity") ||
      names.includes("delete_identity"),
    `expected at least one identity tool, got: ${names.join(", ")}`,
  );
});

test("app query is expanded to application tools", () => {
  const results = searchTools(REGISTRY, "app");
  const names = results.map((r) => r.name);
  assert.ok(names.includes("list_applications"));
});

test("create verb ranks POST tools higher than GET tools for matching subject", () => {
  const results = searchTools(REGISTRY, "create identity");
  assert.ok(results.length > 0);
  // create_identity (POST + name match + verb→POST bonus) should beat list_identities
  const top = results[0].name;
  assert.equal(top, "create_identity", `expected create_identity at top, got: ${top}`);
});

test("delete verb ranks DELETE tools higher", () => {
  const results = searchTools(REGISTRY, "delete identity");
  assert.equal(results[0].name, "delete_identity");
});

test("list verb ranks GET tools higher", () => {
  const results = searchTools(REGISTRY, "list groups");
  assert.equal(results[0].name, "list_groups");
});

test("natural-language query 'add user to group' surfaces add_group_members", () => {
  const results = searchTools(REGISTRY, "add user to group");
  const names = results.map((r) => r.name);
  assert.ok(
    names.includes("add_group_members"),
    `expected add_group_members in results, got: ${names.join(", ")}`,
  );
});

test("results are capped at 10", () => {
  // Build a registry with 20 matching tools.
  const many: ToolMeta[] = Array.from({ length: 20 }, (_, i) => ({
    name: `list_things_${i}`,
    description: "List things",
    tags: ["Things"],
    method: "GET",
    pathTemplate: "/things",
  }));
  assert.ok(searchTools(many, "things").length <= 10);
});

test("non-matching query returns empty results (rather than every tool)", () => {
  assert.deepEqual(searchTools(REGISTRY, "quantum chromodynamics"), []);
});

test("'revoke credential' finds revoke_credential and ranks it first", () => {
  // `cred` synonym expansion includes `credential` and `passkey`; verb `revoke` → DELETE.
  const results = searchTools(REGISTRY, "revoke credential");
  assert.equal(results[0].name, "revoke_credential");
});

test("sso query expands to sso_config family", () => {
  const results = searchTools(REGISTRY, "sso");
  const names = results.map((r) => r.name);
  assert.ok(names.includes("create_sso_config"));
});

test("tokenizer is case-insensitive", () => {
  const lower = searchTools(REGISTRY, "list groups");
  const upper = searchTools(REGISTRY, "LIST GROUPS");
  const mixed = searchTools(REGISTRY, "List GrOuPs");
  assert.deepEqual(
    lower.map((r) => r.name),
    upper.map((r) => r.name),
  );
  assert.deepEqual(
    lower.map((r) => r.name),
    mixed.map((r) => r.name),
  );
});

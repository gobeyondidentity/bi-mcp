// Local workarounds for confirmed bugs in the upstream OpenAPI specs.
// Each patch documents the bug and is idempotent — `alreadyApplied` lets us
// skip silently if a future spec download already has the fix; if `apply`
// runs but doesn't make `alreadyApplied` true, the runner throws so we
// notice the upstream change.

import type { Document } from "yaml";
import { isMap, isScalar } from "yaml";

export interface SpecPatch {
  description: string;
  spec: "v1" | "v0";
  alreadyApplied(doc: Document): boolean;
  apply(doc: Document): void;
}

// Tiny helper — yaml's getIn() can return undefined or the wrong node type.
function getMap(doc: Document, path: ReadonlyArray<string>): ReturnType<Document["getIn"]> | undefined {
  const node = doc.getIn(path as Array<unknown>, true);
  return isMap(node) ? node : undefined;
}

function getScalarValue(doc: Document, path: ReadonlyArray<string>): unknown {
  const node = doc.getIn(path as Array<unknown>, true);
  if (isScalar(node)) return node.value;
  return node;
}

// ── Patches ────────────────────────────────────────────────────────────────

export const SPEC_PATCHES: SpecPatch[] = [
  {
    // The v1 CreateRole operation's requestBody schema declares
    // `properties: {group: ...}` but `required: [role]`. The server accepts
    // `role` per the in-spec example. The `group` is a copy-paste leftover
    // from when roles reused the Group schema.
    description: "v1 CreateRole: rename requestBody property `group` → `role`",
    spec: "v1",
    alreadyApplied(doc) {
      const props = getMap(doc, [
        "paths",
        "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers/{resource_server_id}/roles",
        "post",
        "requestBody",
        "content",
        "application/json",
        "schema",
        "properties",
      ]);
      if (!props) return false;
      return props.has("role") && !props.has("group");
    },
    apply(doc) {
      const propsPath: Array<unknown> = [
        "paths",
        "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers/{resource_server_id}/roles",
        "post",
        "requestBody",
        "content",
        "application/json",
        "schema",
        "properties",
      ];
      const props = doc.getIn(propsPath, true);
      if (!isMap(props)) throw new Error("CreateRole properties not found");
      const groupValue = props.get("group", true);
      if (groupValue === undefined) throw new Error("CreateRole `group` property missing");
      props.delete("group");
      props.set("role", groupValue);
    },
  },

  {
    // v1 SCIMCreateUser wraps the body in `{user: SCIMUser}` but the server
    // expects a flat SCIM User per RFC 7644 §3.3. Replace the wrapper object
    // schema with a direct $ref to SCIMUser.
    description: "v1 SCIMCreateUser: unwrap {user: SCIMUser} → flat SCIMUser",
    spec: "v1",
    alreadyApplied(doc) {
      const schema = getMap(doc, [
        "paths",
        "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Users",
        "post",
        "requestBody",
        "content",
        "application/json",
        "schema",
      ]);
      if (!schema) return false;
      // Already-unwrapped: the schema is a $ref, not an object with properties.user.
      return schema.has("$ref") && !schema.has("properties");
    },
    apply(doc) {
      replaceWithRef(doc, [
        "paths",
        "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Users",
        "post",
        "requestBody",
        "content",
        "application/json",
        "schema",
      ], "#/components/schemas/SCIMUser");
    },
  },

  {
    // Same bug as SCIMCreateUser, for Groups. The Groups path is also
    // affected by the trailing-slash bug (handled separately in generate.ts).
    description: "v1 SCIMCreateGroup: unwrap {group: SCIMGroup} → flat SCIMGroup",
    spec: "v1",
    alreadyApplied(doc) {
      const schema = getMap(doc, [
        "paths",
        "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Groups/",
        "post",
        "requestBody",
        "content",
        "application/json",
        "schema",
      ]) ?? getMap(doc, [
        // In case the path key gets normalized upstream
        "paths",
        "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Groups",
        "post",
        "requestBody",
        "content",
        "application/json",
        "schema",
      ]);
      if (!schema) return false;
      return schema.has("$ref") && !schema.has("properties");
    },
    apply(doc) {
      const variants: Array<Array<unknown>> = [
        [
          "paths",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Groups/",
          "post",
          "requestBody",
          "content",
          "application/json",
          "schema",
        ],
        [
          "paths",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Groups",
          "post",
          "requestBody",
          "content",
          "application/json",
          "schema",
        ],
      ];
      for (const path of variants) {
        if (doc.hasIn(path)) {
          replaceWithRef(doc, path as ReadonlyArray<string>, "#/components/schemas/SCIMGroup");
          return;
        }
      }
      throw new Error("SCIMCreateGroup schema not found in either path variant");
    },
  },

  {
    // v1 SCIMReplaceUser (PUT) — same wrap bug as create. PUT body should be
    // a flat SCIM User resource per RFC 7644 §3.5.1.
    description: "v1 SCIMReplaceUser: unwrap {user: SCIMUser} → flat SCIMUser",
    spec: "v1",
    alreadyApplied(doc) {
      const schema = getMap(doc, [
        "paths",
        "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Users/{user_id}",
        "put",
        "requestBody",
        "content",
        "application/json",
        "schema",
      ]);
      if (!schema) return false;
      return schema.has("$ref") && !schema.has("properties");
    },
    apply(doc) {
      replaceWithRef(doc, [
        "paths",
        "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Users/{user_id}",
        "put",
        "requestBody",
        "content",
        "application/json",
        "schema",
      ], "#/components/schemas/SCIMUser");
    },
  },

  {
    // v0 SCIMReplaceUser (PUT /scim/v2/Users/{user_id}) has the same wrap
    // bug as v1 SCIMCreateUser. Server expects a flat SCIM User.
    description: "v0 SCIMReplaceUser: unwrap {user: SCIMUser} → flat SCIMUser",
    spec: "v0",
    alreadyApplied(doc) {
      const schema = getMap(doc, [
        "paths",
        "/scim/v2/Users/{user_id}",
        "put",
        "requestBody",
        "content",
        "application/json",
        "schema",
      ]);
      if (!schema) return false;
      return schema.has("$ref") && !schema.has("properties");
    },
    apply(doc) {
      replaceWithRef(doc, [
        "paths",
        "/scim/v2/Users/{user_id}",
        "put",
        "requestBody",
        "content",
        "application/json",
        "schema",
      ], "#/components/schemas/SCIMUser");
    },
  },

  {
    // v1 SCIMUpdateUser (PATCH) — spec types the body as {user: SCIMUser} but
    // a SCIM PATCH body should be a PatchOp ({schemas, Operations}). Double
    // bug: wrong wrapper AND wrong schema. There's no PatchOp ref in the spec
    // to point at, so substitute an inline shape.
    description: "v1 SCIMUpdateUser: replace {user: SCIMUser} wrapper with inline PatchOp schema",
    spec: "v1",
    alreadyApplied(doc) {
      const props = getMap(doc, [
        "paths",
        "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Users/{user_id}",
        "patch",
        "requestBody",
        "content",
        "application/json",
        "schema",
        "properties",
      ]);
      return Boolean(props?.has("Operations"));
    },
    apply(doc) {
      replaceWithInlinePatchOp(doc, [
        "paths",
        "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Users/{user_id}",
        "patch",
        "requestBody",
        "content",
        "application/json",
        "schema",
      ]);
    },
  },

  {
    description: "v1 SCIMUpdateGroup: replace {group: SCIMGroup} wrapper with inline PatchOp schema",
    spec: "v1",
    alreadyApplied(doc) {
      const props = getMap(doc, [
        "paths",
        "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Groups/{group_id}",
        "patch",
        "requestBody",
        "content",
        "application/json",
        "schema",
        "properties",
      ]);
      return Boolean(props?.has("Operations"));
    },
    apply(doc) {
      replaceWithInlinePatchOp(doc, [
        "paths",
        "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Groups/{group_id}",
        "patch",
        "requestBody",
        "content",
        "application/json",
        "schema",
      ]);
    },
  },
];

// Mutate a YAMLMap schema node in place: clear its existing wrapper-object
// keys (type/properties/required/etc.) and set $ref. Keeps node identity so
// downstream getIn() reflects the change immediately.
const SCHEMA_WRAPPER_KEYS = [
  "type",
  "properties",
  "required",
  "title",
  "description",
  "additionalProperties",
];

function replaceWithRef(
  doc: Document,
  schemaPath: ReadonlyArray<string>,
  refTarget: string,
): void {
  const schema = doc.getIn(schemaPath as Array<unknown>, true);
  if (!isMap(schema)) {
    throw new Error(`schema at path ${schemaPath.join("/")} is not a YAMLMap`);
  }
  for (const key of SCHEMA_WRAPPER_KEYS) schema.delete(key);
  schema.set("$ref", refTarget);
}

// Mutate a YAMLMap schema node in place to be an inline SCIM PatchOp body
// per RFC 7644 §3.5.2: { schemas: string[], Operations: [{op, path?, value?}] }.
// Used for endpoints whose spec wrongly types the body as the resource itself
// (SCIMUser/SCIMGroup) when the server actually wants a PatchOp.
function replaceWithInlinePatchOp(
  doc: Document,
  schemaPath: ReadonlyArray<string>,
): void {
  const schema = doc.getIn(schemaPath as Array<unknown>, true);
  if (!isMap(schema)) {
    throw new Error(`schema at path ${schemaPath.join("/")} is not a YAMLMap`);
  }
  for (const key of SCHEMA_WRAPPER_KEYS) schema.delete(key);
  schema.delete("$ref");
  // Use createNode to convert nested JS objects into proper YAML tree nodes —
  // otherwise the alreadyApplied check can't traverse `properties` because it
  // remains a plain JS object until serialization.
  schema.set("type", "object");
  schema.set(
    "properties",
    doc.createNode({
      schemas: { type: "array", items: { type: "string" } },
      Operations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            op: { type: "string", enum: ["add", "remove", "replace"] },
            path: { type: "string" },
            // SCIM leaves `value` open — depends on `path`. Permissive any.
            value: {},
          },
          required: ["op"],
        },
      },
    }),
  );
  schema.set("required", doc.createNode(["schemas", "Operations"]));
}

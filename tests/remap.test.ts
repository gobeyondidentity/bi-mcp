import { test } from "node:test";
import assert from "node:assert/strict";
import { applyRemap } from "../src/remap.js";

// These safe-key forms must match what sanitizeKey actually produces.
// sanitizeKey keeps `.` as allowed, so version segments stay as e.g. `2.0`.
const SCIM_REMAP: Record<string, string> = {
  "urn_ietf_params_scim_schemas_extension_enterprise_2.0_User":
    "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User",
  "urn_scim_schemas_extension_byndid_1.0_Group":
    "urn:scim:schemas:extension:byndid:1.0:Group",
  _ref: "$ref",
};

test("returns primitives unchanged", () => {
  assert.equal(applyRemap(null, SCIM_REMAP), null);
  assert.equal(applyRemap(undefined, SCIM_REMAP), undefined);
  assert.equal(applyRemap(42, SCIM_REMAP), 42);
  assert.equal(applyRemap("hello", SCIM_REMAP), "hello");
  assert.equal(applyRemap(true, SCIM_REMAP), true);
});

test("passes objects through untouched when no keys overlap remap", () => {
  const input = { a: 1, b: "two", c: [3, 4] };
  assert.deepEqual(applyRemap(input, SCIM_REMAP), input);
});

test("renames a top-level sanitized key back to its original", () => {
  const input = { _ref: "https://example.com/u/1" };
  assert.deepEqual(applyRemap(input, SCIM_REMAP), {
    $ref: "https://example.com/u/1",
  });
});

test("renames a top-level URN-style sanitized key back to its original", () => {
  // The case the entire sanitize+remap pipeline exists for.
  const input = {
    "urn_ietf_params_scim_schemas_extension_enterprise_2.0_User": {
      employeeNumber: "E42",
    },
  };
  assert.deepEqual(applyRemap(input, SCIM_REMAP), {
    "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User": {
      employeeNumber: "E42",
    },
  });
});

test("renames a URN-style sanitized key nested inside a wrapper object (v1 SCIM shape)", () => {
  // Models v1's `user`-wrapped SCIM body shape, which is the actual structure
  // the generated v1 SCIM handlers pass to applyRemap.
  const input = {
    user: {
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
      userName: "alice",
      "urn_ietf_params_scim_schemas_extension_enterprise_2.0_User": {
        employeeNumber: "E42",
      },
    },
  };
  assert.deepEqual(applyRemap(input, SCIM_REMAP), {
    user: {
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
      userName: "alice",
      "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User": {
        employeeNumber: "E42",
      },
    },
  });
});

test("renames sanitized keys inside arrays of objects", () => {
  const input = {
    members: [{ _ref: "u1", value: "a" }, { _ref: "u2", value: "b" }],
  };
  assert.deepEqual(applyRemap(input, SCIM_REMAP), {
    members: [{ $ref: "u1", value: "a" }, { $ref: "u2", value: "b" }],
  });
});

test("does not double-rename: already-original keys pass through", () => {
  // After static top-level restoration the URN is already in original form.
  // applyRemap should leave it alone (the dict only maps safe→original).
  const input = {
    "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User": {
      employeeNumber: "E42",
    },
  };
  assert.deepEqual(applyRemap(input, SCIM_REMAP), input);
});

test("handles a top-level restored key whose value contains nested renames", () => {
  // The agent submits sanitized keys; the generator restores the top-level URN
  // statically but the nested $ref inside the value still needs renaming.
  const input = {
    "urn:scim:schemas:extension:byndid:1.0:Group": {
      members: [{ _ref: "u1" }],
    },
  };
  assert.deepEqual(applyRemap(input, SCIM_REMAP), {
    "urn:scim:schemas:extension:byndid:1.0:Group": {
      members: [{ $ref: "u1" }],
    },
  });
});

test("walks deeply nested structures", () => {
  const input = {
    a: { b: { c: { d: { _ref: "deep" } } } },
  };
  assert.deepEqual(applyRemap(input, SCIM_REMAP), {
    a: { b: { c: { d: { $ref: "deep" } } } },
  });
});

test("empty remap is effectively a deep clone (and a no-op semantically)", () => {
  const input = { _ref: "x", nested: { _ref: "y" } };
  const result = applyRemap(input, {});
  assert.deepEqual(result, input);
});

test("does not mutate the input object", () => {
  const input = { _ref: "a", nested: { _ref: "b" } };
  const snapshot = JSON.parse(JSON.stringify(input));
  applyRemap(input, SCIM_REMAP);
  assert.deepEqual(input, snapshot);
});

test("combined v0 scim_create_group shape round-trips", () => {
  const body = {
    schemas: ["urn:scim:schemas:extension:byndid:1.0:Group"],
    displayName: "Engineering",
    members: [{ _ref: "u-1" }, { _ref: "u-2" }],
    "urn:scim:schemas:extension:byndid:1.0:Group": {
      description: "All engineers",
    },
  };
  assert.deepEqual(applyRemap(body, SCIM_REMAP), {
    schemas: ["urn:scim:schemas:extension:byndid:1.0:Group"],
    displayName: "Engineering",
    members: [{ $ref: "u-1" }, { $ref: "u-2" }],
    "urn:scim:schemas:extension:byndid:1.0:Group": {
      description: "All engineers",
    },
  });
});

test("primitive arrays pass through", () => {
  assert.deepEqual(applyRemap([1, 2, 3], SCIM_REMAP), [1, 2, 3]);
  assert.deepEqual(applyRemap(["a", "b"], SCIM_REMAP), ["a", "b"]);
});

test("array of mixed primitive and objects", () => {
  assert.deepEqual(
    applyRemap([1, { _ref: "x" }, "s", null], SCIM_REMAP),
    [1, { $ref: "x" }, "s", null],
  );
});

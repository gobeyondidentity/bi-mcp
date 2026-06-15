import { test } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApiClient } from "../src/client.js";
import { registerV1Tools } from "../src/generated/v1-tools.js";
import { registerV0Tools } from "../src/generated/v0-tools.js";
import { KEY_PATTERN } from "../src/keys.js";

interface CapturedTool {
  name: string;
  config: {
    description?: string;
    inputSchema?: Record<string, z.ZodTypeAny>;
    annotations?: Record<string, unknown>;
  };
}

function captureTools(
  registerFn: (server: McpServer, apiClient: ApiClient) => void,
): CapturedTool[] {
  const captured: CapturedTool[] = [];
  const stubServer = {
    registerTool: (name: string, config: CapturedTool["config"]) => {
      captured.push({ name, config });
    },
  } as unknown as McpServer;
  const stubClient = {} as ApiClient;
  registerFn(stubServer, stubClient);
  return captured;
}

const v1Tools = captureTools(registerV1Tools);
const v0Tools = captureTools(registerV0Tools);

test("v1 register-fn emits the expected number of tools", () => {
  assert.equal(v1Tools.length, 104);
});

test("v0 register-fn emits the expected number of tools", () => {
  assert.equal(v0Tools.length, 35);
});

test("every v1 tool name passes KEY_PATTERN", () => {
  for (const t of v1Tools) {
    assert.match(t.name, KEY_PATTERN, `bad tool name: ${t.name}`);
  }
});

test("every v0 tool name passes KEY_PATTERN", () => {
  for (const t of v0Tools) {
    assert.match(t.name, KEY_PATTERN, `bad tool name: ${t.name}`);
  }
});

test("every v1 tool's top-level inputSchema keys pass KEY_PATTERN", () => {
  for (const t of v1Tools) {
    const schema = t.config.inputSchema ?? {};
    for (const key of Object.keys(schema)) {
      assert.match(
        key,
        KEY_PATTERN,
        `v1 tool ${t.name} has invalid top-level inputSchema key: ${key}`,
      );
    }
  }
});

test("every v0 tool's top-level inputSchema keys pass KEY_PATTERN", () => {
  for (const t of v0Tools) {
    const schema = t.config.inputSchema ?? {};
    for (const key of Object.keys(schema)) {
      assert.match(
        key,
        KEY_PATTERN,
        `v0 tool ${t.name} has invalid top-level inputSchema key: ${key}`,
      );
    }
  }
});

test("every v1 inputSchema can wrap into a valid Zod object", () => {
  for (const t of v1Tools) {
    const schema = t.config.inputSchema ?? {};
    assert.doesNotThrow(
      () => z.object(schema),
      `v1 tool ${t.name} has malformed Zod schema`,
    );
  }
});

test("every v0 inputSchema can wrap into a valid Zod object", () => {
  for (const t of v0Tools) {
    const schema = t.config.inputSchema ?? {};
    assert.doesNotThrow(
      () => z.object(schema),
      `v0 tool ${t.name} has malformed Zod schema`,
    );
  }
});

test("v0 scim_create_user uses the sanitized enterprise-extension alias", () => {
  // Regression guard for the bug that motivated the sanitize+remap pipeline.
  const tool = v0Tools.find((t) => t.name === "scim_create_user");
  assert.ok(tool, "scim_create_user not registered on v0");
  const keys = Object.keys(tool!.config.inputSchema ?? {});
  assert.ok(
    keys.includes(
      "urn_ietf_params_scim_schemas_extension_enterprise_2.0_User",
    ),
    `expected sanitized enterprise URN key, got: ${keys.join(", ")}`,
  );
  assert.ok(
    !keys.some((k) => k.includes(":")),
    "no top-level key should contain a colon",
  );
});

test("v0 scim_create_group uses the sanitized byndid-extension alias", () => {
  const tool = v0Tools.find((t) => t.name === "scim_create_group");
  assert.ok(tool, "scim_create_group not registered on v0");
  const keys = Object.keys(tool!.config.inputSchema ?? {});
  assert.ok(
    keys.includes("urn_scim_schemas_extension_byndid_1.0_Group"),
    `expected sanitized byndid URN key, got: ${keys.join(", ")}`,
  );
});

test("v1 SCIM user tools keep their wrapper structure (URN nested under `user`)", () => {
  // Sanity check that the v1 platform wrapping is preserved post-fix.
  for (const name of ["scim_create_user", "scim_replace_user", "scim_update_user"]) {
    const tool = v1Tools.find((t) => t.name === name);
    assert.ok(tool, `${name} not registered on v1`);
    const keys = Object.keys(tool!.config.inputSchema ?? {});
    assert.ok(keys.includes("user"), `${name} should have top-level \`user\` key`);
  }
});

test("read-only annotation set on GET tools (sampled)", () => {
  const getTenant = v1Tools.find((t) => t.name === "get_tenant");
  assert.ok(getTenant);
  assert.equal(getTenant!.config.annotations?.readOnlyHint, true);
});

test("destructive annotation set on DELETE tools (sampled)", () => {
  const deleteRealm = v1Tools.find((t) => t.name === "delete_realm");
  assert.ok(deleteRealm);
  assert.equal(deleteRealm!.config.annotations?.destructiveHint, true);
});

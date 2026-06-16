// In-process integration tests for the MCP + API stack. These tests boot the
// real McpServer with the real generated tools, talk to it through the real
// MCP Client over a paired InMemoryTransport, and stub `fetch` at the boundary.
// Each test closes a specific gap that the unit-test suite leaves open:
//
//   Test 1  →  Zod-to-JSON-Schema conversion via real MCP framing
//              (unit tests use a stub server and never serialize through MCP)
//   Test 2  →  Full SCIM URN sanitize+remap composition across the chain
//              (applyRemap is unit-tested in isolation; the full chain is not)
//   Test 3  →  Generated try/catch handler emitted by scripts/generate.ts
//              (the catch block is identical across all 139 tools but never invoked)
//   Test 4  →  Every generated tool handler executes without crashing
//              (the closures are type-checked but never called)
//
// Inversion sanity checks for each test are documented in the plan.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  startTestServer,
  jsonResponse,
  synthesizeArgs,
  SKIP_SYNTHESIS,
  V0_TEST_CONFIG,
  V1_TEST_CONFIG,
} from "./helpers/integration.js";
import { KEY_PATTERN } from "../src/keys.js";

// ── Test 1: tools/list audit through real MCP framing ───────────────────────

test("integration: v1 tools/list returns ≥100 tools through MCP framing, all keys pass KEY_PATTERN", async () => {
  const { client, shutdown } = await startTestServer({ config: V1_TEST_CONFIG });
  try {
    const { tools } = await client.listTools();
    assert.ok(tools.length >= 100, `expected ≥100 v1 tools, got ${tools.length}`);
    assert.ok(
      tools.some((t) => t.name === "search_tools"),
      "search_tools should be registered",
    );
    for (const tool of tools) {
      assert.match(tool.name, KEY_PATTERN, `bad tool name: ${tool.name}`);
      const props = (tool.inputSchema as { properties?: Record<string, unknown> })
        .properties ?? {};
      for (const key of Object.keys(props)) {
        assert.match(
          key,
          KEY_PATTERN,
          `tool ${tool.name} has invalid top-level inputSchema key after MCP framing: ${key}`,
        );
      }
    }
  } finally {
    await shutdown();
  }
});

test("integration: v0 tools/list returns ≥30 tools through MCP framing, all keys pass KEY_PATTERN", async () => {
  const { client, shutdown } = await startTestServer({ config: V0_TEST_CONFIG });
  try {
    const { tools } = await client.listTools();
    assert.ok(tools.length >= 30, `expected ≥30 v0 tools, got ${tools.length}`);
    for (const tool of tools) {
      assert.match(tool.name, KEY_PATTERN);
      const props = (tool.inputSchema as { properties?: Record<string, unknown> })
        .properties ?? {};
      for (const key of Object.keys(props)) {
        assert.match(key, KEY_PATTERN);
      }
    }
  } finally {
    await shutdown();
  }
});

// ── Test 2: SCIM scim_create_user end-to-end remap proof ────────────────────

test("integration: v0 scim_create_user sends original URN keys to the API after agent submitted sanitized form", async () => {
  const { client, captures, shutdown } = await startTestServer({
    config: V0_TEST_CONFIG,
    respond: () => jsonResponse({ id: "u1" }),
  });
  try {
    const result = await client.callTool({
      name: "scim_create_user",
      arguments: {
        schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
        externalId: "ext-1",
        userName: "alice",
        displayName: "Alice",
        active: true,
        emails: [{ value: "a@x.com", type: "work", primary: true }],
        name: { givenName: "Alice", familyName: "Wonderland" },
        // The agent-facing form: sanitized key (what the MCP schema advertises).
        "urn_ietf_params_scim_schemas_extension_enterprise_2.0_User": {
          employeeNumber: "E42",
        },
      },
    });

    // The handler must succeed.
    assert.notEqual(
      result.isError,
      true,
      `expected scim_create_user to succeed, got: ${JSON.stringify(result.content)}`,
    );
    assert.equal(captures.length, 1, "expected exactly one outgoing fetch");

    // The wire body must carry the ORIGINAL URN key, not the sanitized alias.
    const sent = JSON.parse(captures[0].body!) as Record<string, unknown>;
    const urnKey =
      "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User";
    assert.ok(
      urnKey in sent,
      `expected outgoing body to contain "${urnKey}", got keys: ${Object.keys(sent).join(", ")}`,
    );
    assert.ok(
      !("urn_ietf_params_scim_schemas_extension_enterprise_2.0_User" in sent),
      "sanitized alias should NOT appear in outgoing body",
    );
    assert.deepEqual(sent[urnKey], { employeeNumber: "E42" });
    // Sibling fields unchanged
    assert.equal(sent.userName, "alice");
    assert.equal(sent.externalId, "ext-1");
  } finally {
    await shutdown();
  }
});

// ── Test 3: error path through the generated catch block ────────────────────

test("integration: 401 response surfaces as MCP isError=true with status, code, and message preserved", async () => {
  const { client, shutdown } = await startTestServer({
    config: V1_TEST_CONFIG,
    respond: () =>
      new Response(
        JSON.stringify({ code: "INVALID_TOKEN", message: "token expired" }),
        { status: 401, headers: { "content-type": "application/json" } },
      ),
  });
  try {
    const result = await client.callTool({
      name: "list_realms",
      arguments: {},
    });
    assert.equal(result.isError, true, "expected MCP isError on 401");
    const content = result.content as Array<{ type: string; text: string }>;
    const text = content[0]?.text ?? "";
    assert.match(text, /401/, "expected status code in error text");
    assert.match(text, /INVALID_TOKEN/, "expected error code in error text");
    assert.match(text, /token expired/, "expected error message in error text");
  } finally {
    await shutdown();
  }
});

// ── Test 4: every generated handler can be invoked through the real client ──

async function runHandlerSmoke(platform: "v0" | "v1") {
  const config = platform === "v1" ? V1_TEST_CONFIG : V0_TEST_CONFIG;
  const { client, captures, zodSchemas, shutdown } = await startTestServer({
    config,
    respond: () => jsonResponse({}),
  });
  try {
    const { tools } = await client.listTools();
    const skipped: string[] = [];
    const failures: Array<{ name: string; reason: string }> = [];
    let invoked = 0;

    for (const tool of tools) {
      // search_tools doesn't go through ApiClient — skip in this smoke.
      if (tool.name === "search_tools") continue;

      const schema = zodSchemas[tool.name];
      if (!schema) {
        skipped.push(`${tool.name} (no captured schema)`);
        continue;
      }
      const args = synthesizeArgs(schema);
      if (args === SKIP_SYNTHESIS) {
        skipped.push(tool.name);
        continue;
      }

      const before = captures.length;
      try {
        const result = await client.callTool({
          name: tool.name,
          arguments: args as Record<string, unknown>,
        });
        if (result.isError) {
          const text =
            (result.content as Array<{ text: string }>)[0]?.text ?? "";
          failures.push({ name: tool.name, reason: `isError: ${text}` });
          continue;
        }
        if (captures.length !== before + 1) {
          failures.push({
            name: tool.name,
            reason: `expected 1 fetch, captured ${captures.length - before}`,
          });
          continue;
        }
        invoked++;
      } catch (err) {
        failures.push({
          name: tool.name,
          reason: `threw: ${(err as Error).message ?? String(err)}`,
        });
      }
    }

    // Hard floor: synthesizer must satisfy at least 70% of tools.
    const eligible = tools.length - 1; // exclude search_tools
    const coverage = invoked / eligible;
    assert.ok(
      coverage >= 0.7,
      `${platform}: invoked ${invoked}/${eligible} (${(coverage * 100).toFixed(0)}%); failures=${JSON.stringify(failures)}; skipped=${skipped.join(", ")}`,
    );

    // Zero handler crashes are acceptable. Synthesizer skips are.
    assert.equal(
      failures.length,
      0,
      `${platform} handler failures:\n${failures.map((f) => `  ${f.name}: ${f.reason}`).join("\n")}`,
    );
  } finally {
    await shutdown();
  }
}

test("integration: every v1 generated tool handler invokes cleanly", async () => {
  await runHandlerSmoke("v1");
});

test("integration: every v0 generated tool handler invokes cleanly", async () => {
  await runHandlerSmoke("v0");
});

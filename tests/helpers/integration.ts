import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { ApiClient } from "../../src/client.js";
import { registerSearchTool } from "../../src/search.js";
import { registerV0Tools } from "../../src/generated/v0-tools.js";
import { registerV1Tools } from "../../src/generated/v1-tools.js";
import { V0_TOOL_REGISTRY } from "../../src/generated/v0-registry.js";
import { V1_TOOL_REGISTRY } from "../../src/generated/v1-registry.js";
import type { Config } from "../../src/types.js";

export interface CapturedRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const V1_TEST_CONFIG: Config = {
  apiToken: "test-token",
  tenantId: "tenant-xyz",
  platform: "v1",
  region: "US",
  baseUrl: "https://api.example.com",
};

export const V0_TEST_CONFIG: Config = {
  apiToken: "v0-token",
  tenantId: "v0-tenant",
  platform: "v0",
  region: "US",
  baseUrl: "https://api.byndid.example",
};

interface CapturedZodSchema {
  name: string;
  inputSchema: Record<string, z.ZodTypeAny>;
}

function captureZodSchemas(platform: "v0" | "v1"): CapturedZodSchema[] {
  const out: CapturedZodSchema[] = [];
  const stub = {
    registerTool: (
      name: string,
      cfg: { inputSchema?: Record<string, z.ZodTypeAny> },
    ) => {
      out.push({ name, inputSchema: cfg.inputSchema ?? {} });
    },
  } as unknown as McpServer;
  const stubClient = {} as ApiClient;
  const registry = platform === "v1" ? V1_TOOL_REGISTRY : V0_TOOL_REGISTRY;
  registerSearchTool(stub, registry);
  if (platform === "v1") registerV1Tools(stub, stubClient);
  else registerV0Tools(stub, stubClient);
  return out;
}

export async function startTestServer(opts: {
  config: Config;
  respond?: (req: CapturedRequest) => Response | Promise<Response>;
}): Promise<{
  client: Client;
  captures: CapturedRequest[];
  zodSchemas: Record<string, Record<string, z.ZodTypeAny>>;
  shutdown: () => Promise<void>;
}> {
  const respond = opts.respond ?? (() => jsonResponse({}));
  const captures: CapturedRequest[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = (init?.headers ?? {}) as Record<string, string>;
    const captured: CapturedRequest = {
      method: init?.method ?? "GET",
      url: String(input),
      headers,
      body: typeof init?.body === "string" ? init.body : undefined,
    };
    captures.push(captured);
    return await respond(captured);
  }) as typeof fetch;

  const zodSchemas: Record<string, Record<string, z.ZodTypeAny>> = {};
  for (const captured of captureZodSchemas(opts.config.platform)) {
    zodSchemas[captured.name] = captured.inputSchema;
  }

  const apiClient = new ApiClient(opts.config);
  const server = new McpServer(
    { name: "beyond-identity-test", version: "test" },
    { instructions: "" },
  );
  const registry =
    opts.config.platform === "v1" ? V1_TOOL_REGISTRY : V0_TOOL_REGISTRY;
  registerSearchTool(server, registry);
  if (opts.config.platform === "v1") registerV1Tools(server, apiClient);
  else registerV0Tools(server, apiClient);

  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  const client = new Client({ name: "test-client", version: "test" });
  await client.connect(clientTransport);

  return {
    client,
    captures,
    zodSchemas,
    shutdown: async () => {
      await client.close();
      await server.close();
      globalThis.fetch = originalFetch;
    },
  };
}

// ── Args synthesizer ─────────────────────────────────────────────────────────

export const SKIP_SYNTHESIS = Symbol("SKIP_SYNTHESIS");
export type Synthesized = Record<string, unknown> | typeof SKIP_SYNTHESIS;

// Walks a Zod schema and produces a minimum-valid value. Returns SKIP_SYNTHESIS
// if it can't satisfy the schema (unknown type, deep recursion, etc.).
export function synthesizeArgs(
  inputSchema: Record<string, z.ZodTypeAny>,
): Synthesized {
  const out: Record<string, unknown> = {};
  for (const [key, schema] of Object.entries(inputSchema)) {
    if (schema.isOptional()) continue;
    const v = synthesizeValue(schema);
    if (v === SKIP_SYNTHESIS) return SKIP_SYNTHESIS;
    out[key] = v;
  }
  return out;
}

function synthesizeValue(schema: z.ZodTypeAny, depth = 0): unknown {
  if (depth > 12) return SKIP_SYNTHESIS;
  const def = (schema as unknown as { _def: { typeName?: string; [k: string]: unknown } })._def;
  if (!def) return SKIP_SYNTHESIS;
  const typeName = def.typeName as string | undefined;

  switch (typeName) {
    case "ZodString":
      return "test";
    case "ZodNumber":
      return 0;
    case "ZodBoolean":
      return false;
    case "ZodEnum": {
      const values = (def as { values?: unknown[] }).values;
      return Array.isArray(values) && values.length > 0 ? values[0] : SKIP_SYNTHESIS;
    }
    case "ZodNativeEnum": {
      const values = Object.values((def as { values: Record<string, unknown> }).values);
      return values.length > 0 ? values[0] : SKIP_SYNTHESIS;
    }
    case "ZodLiteral":
      return (def as { value: unknown }).value;
    case "ZodArray":
      return [];
    case "ZodObject": {
      const shape = (def as { shape: () => Record<string, z.ZodTypeAny> }).shape();
      const sub: Record<string, unknown> = {};
      for (const [k, s] of Object.entries(shape)) {
        if (s.isOptional()) continue;
        const v = synthesizeValue(s, depth + 1);
        if (v === SKIP_SYNTHESIS) return SKIP_SYNTHESIS;
        sub[k] = v;
      }
      return sub;
    }
    case "ZodUnion":
    case "ZodDiscriminatedUnion": {
      const opts = (def as { options: z.ZodTypeAny[] }).options;
      for (const variant of opts) {
        const v = synthesizeValue(variant, depth + 1);
        if (v !== SKIP_SYNTHESIS) return v;
      }
      return SKIP_SYNTHESIS;
    }
    case "ZodOptional":
    case "ZodNullable":
    case "ZodReadonly":
    case "ZodBranded":
    case "ZodCatch":
    case "ZodDefault":
      return synthesizeValue(
        (def as { innerType: z.ZodTypeAny }).innerType,
        depth + 1,
      );
    case "ZodEffects":
      return synthesizeValue(
        (def as { schema: z.ZodTypeAny }).schema,
        depth + 1,
      );
    case "ZodRecord":
      return {};
    case "ZodAny":
    case "ZodUnknown":
      return null;
    case "ZodIntersection": {
      const left = synthesizeValue(
        (def as { left: z.ZodTypeAny }).left,
        depth + 1,
      );
      const right = synthesizeValue(
        (def as { right: z.ZodTypeAny }).right,
        depth + 1,
      );
      if (
        typeof left === "object" && left !== null && !Array.isArray(left) &&
        typeof right === "object" && right !== null && !Array.isArray(right)
      ) {
        return { ...(left as object), ...(right as object) };
      }
      return left !== SKIP_SYNTHESIS ? left : right;
    }
    default:
      return SKIP_SYNTHESIS;
  }
}

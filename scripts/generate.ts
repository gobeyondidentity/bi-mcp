import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import $RefParser from "@apidevtools/json-schema-ref-parser";
import { sanitizeKey } from "../src/keys.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ── Types ──────────────────────────────────────────────────────────────────

interface OpenApiSpec {
  paths: Record<string, Record<string, OperationObject>>;
  tags?: Array<{ name: string; description?: string }>;
}

interface OperationObject {
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: ParameterObject[];
  requestBody?: RequestBodyObject;
  security?: Array<Record<string, string[]>>;
}

interface ParameterObject {
  name: string;
  in: string;
  required?: boolean;
  description?: string;
  schema?: SchemaObject;
}

interface RequestBodyObject {
  required?: boolean;
  content?: Record<string, { schema?: SchemaObject }>;
}

interface SchemaObject {
  type?: string;
  format?: string;
  description?: string;
  enum?: unknown[];
  properties?: Record<string, SchemaObject>;
  items?: SchemaObject;
  required?: string[];
  additionalProperties?: boolean | SchemaObject;
  oneOf?: SchemaObject[];
  anyOf?: SchemaObject[];
  allOf?: SchemaObject[];
  $ref?: string;
  readOnly?: boolean;
  default?: unknown;
  minimum?: number;
  maximum?: number;
}

interface ToolDef {
  name: string;
  operationId: string;
  method: string;
  pathTemplate: string;
  description: string;
  tags: string[];
  pathParams: Array<{ name: string; description: string }>;
  queryParams: Array<{
    name: string;
    required: boolean;
    description: string;
    schema: SchemaObject;
  }>;
  bodySchema: SchemaObject | null;
  // Whether the OpenAPI requestBody.required flag is true — i.e. the body as a
  // whole must be present. If false, every body field is emitted as optional
  // regardless of its individual `required` membership.
  bodyRequired: boolean;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function operationIdToSnakeCase(opId: string): string {
  // CamelCase → snake_case
  return opId
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
    .toLowerCase();
}

function escapeString(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

// ── JSON Schema → Zod code string ───────────────────────────────────────────

// Walks a schema we're about to drop (because of depth bail-out) just to add
// any non-conforming property keys to the remap as a defensive last-ditch net.
// No Zod output, no schema effect — only remap is mutated.
function harvestNonConformingKeys(
  schema: SchemaObject,
  remap: Map<string, string>,
  depth: number = 0,
): void {
  if (depth > 20 || !schema || typeof schema !== "object") return;
  if (schema.properties) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      const safe = sanitizeKey(key);
      if (safe !== key) recordRemap(remap, safe, key);
      harvestNonConformingKeys(propSchema, remap, depth + 1);
    }
  }
  if (schema.items) harvestNonConformingKeys(schema.items, remap, depth + 1);
  for (const variants of [schema.oneOf, schema.anyOf, schema.allOf]) {
    if (variants) {
      for (const v of variants) harvestNonConformingKeys(v, remap, depth + 1);
    }
  }
}

// Records safeKey → originalKey in the remap, throwing if a different original
// is already mapped to the same safeKey (sanitization collision).
function recordRemap(
  remap: Map<string, string>,
  safeKey: string,
  originalKey: string,
): void {
  const existing = remap.get(safeKey);
  if (existing !== undefined && existing !== originalKey) {
    throw new Error(
      `Sanitization collision: both "${existing}" and "${originalKey}" reduce to "${safeKey}". ` +
        `Disambiguate one of them or extend the sanitizer.`,
    );
  }
  remap.set(safeKey, originalKey);
}

function jsonSchemaToZod(
  schema: SchemaObject,
  remap: Map<string, string>,
  depth: number = 0,
): string {
  if (depth > 10) {
    harvestNonConformingKeys(schema, remap, depth);
    return "z.any()";
  }

  // Handle allOf by merging
  if (schema.allOf && schema.allOf.length > 0) {
    // Try to merge into a single object
    const merged: SchemaObject = { type: "object", properties: {}, required: [] };
    for (const sub of schema.allOf) {
      if (sub.properties) {
        merged.properties = { ...merged.properties, ...sub.properties };
      }
      if (sub.required) {
        merged.required = [...(merged.required ?? []), ...sub.required];
      }
    }
    if (Object.keys(merged.properties ?? {}).length > 0) {
      return jsonSchemaToZod(merged, remap, depth);
    }
    return "z.any()";
  }

  // Handle oneOf/anyOf
  if (schema.oneOf || schema.anyOf) {
    const variants = (schema.oneOf ?? schema.anyOf)!;
    if (variants.length === 1) return jsonSchemaToZod(variants[0], remap, depth + 1);
    if (variants.length >= 2) {
      const first = jsonSchemaToZod(variants[0], remap, depth + 1);
      const second = jsonSchemaToZod(variants[1], remap, depth + 1);
      let result = `z.union([${first}, ${second}`;
      for (let i = 2; i < variants.length; i++) {
        result += `, ${jsonSchemaToZod(variants[i], remap, depth + 1)}`;
      }
      result += "])";
      return result;
    }
    return "z.any()";
  }

  const desc = schema.description
    ? `.describe("${escapeString(schema.description.slice(0, 200))}")`
    : "";

  switch (schema.type) {
    case "string": {
      if (schema.enum) {
        const values = schema.enum
          .filter((v): v is string => typeof v === "string")
          .map((v) => `"${escapeString(v)}"`)
          .join(", ");
        return `z.enum([${values}])${desc}`;
      }
      return `z.string()${desc}`;
    }
    case "integer":
    case "number":
      return `z.number()${desc}`;
    case "boolean":
      return `z.boolean()${desc}`;
    case "array": {
      const itemsZod = schema.items
        ? jsonSchemaToZod(schema.items, remap, depth + 1)
        : "z.any()";
      return `z.array(${itemsZod})${desc}`;
    }
    case "object": {
      if (
        !schema.properties ||
        Object.keys(schema.properties).length === 0
      ) {
        return `z.record(z.any())${desc}`;
      }
      const requiredSet = new Set(schema.required ?? []);
      const fields: string[] = [];
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (propSchema.readOnly) continue;
        const safeKey = sanitizeKey(key);
        if (safeKey !== key) recordRemap(remap, safeKey, key);
        const fieldZod = jsonSchemaToZod(propSchema, remap, depth + 1);
        const isRequired = requiredSet.has(key);
        fields.push(
          `    ${JSON.stringify(safeKey)}: ${fieldZod}${isRequired ? "" : ".optional()"}`,
        );
      }
      if (fields.length === 0) return `z.record(z.any())${desc}`;
      return `z.object({\n${fields.join(",\n")},\n  })${desc}`;
    }
    default:
      return `z.any()${desc}`;
  }
}

// ── Extract tool definitions from an OpenAPI spec ───────────────────────────

const HTTP_METHODS = ["get", "post", "put", "patch", "delete"] as const;

function extractTools(
  spec: OpenApiSpec,
  platform: "v1" | "v0",
): ToolDef[] {
  const tools: ToolDef[] = [];
  const paths = spec.paths ?? {};

  // Params that are auto-injected and should NOT appear as tool inputs
  const autoInjectedParams =
    platform === "v1" ? new Set(["tenant_id"]) : new Set<string>();

  for (const [pathTemplate, pathItem] of Object.entries(paths)) {
    // Collect path-level parameters (shared by all methods on this path)
    const pathLevelParams = (pathItem as Record<string, unknown>).parameters as ParameterObject[] | undefined;

    for (const method of HTTP_METHODS) {
      const operation = pathItem[method] as OperationObject | undefined;
      if (!operation?.operationId) continue;

      const name = operationIdToSnakeCase(operation.operationId);
      const description = (
        operation.summary ??
        operation.description ??
        operation.operationId
      )
        .replace(/\n/g, " ")
        .slice(0, 500);

      const tags = operation.tags ?? ["Untagged"];

      // Merge path-level and operation-level params (operation overrides path)
      const allParams: ParameterObject[] = [];
      const seenParams = new Set<string>();
      for (const param of operation.parameters ?? []) {
        allParams.push(param);
        seenParams.add(`${param.in}:${param.name}`);
      }
      for (const param of pathLevelParams ?? []) {
        if (!seenParams.has(`${param.in}:${param.name}`)) {
          allParams.push(param);
        }
      }

      // Also extract path params directly from the path template
      // in case the spec doesn't explicitly list them
      const pathParamNames = new Set(
        [...pathTemplate.matchAll(/\{(\w+)\}/g)].map((m) => m[1]),
      );

      // Path params (excluding auto-injected ones)
      const pathParams: ToolDef["pathParams"] = [];
      const queryParams: ToolDef["queryParams"] = [];
      const handledPathParams = new Set<string>();

      for (const param of allParams) {
        if (autoInjectedParams.has(param.name)) continue;

        if (param.in === "path") {
          pathParams.push({
            name: param.name,
            description: param.description ?? `The ${param.name}`,
          });
          handledPathParams.add(param.name);
        } else if (param.in === "query") {
          queryParams.push({
            name: param.name,
            required: param.required ?? false,
            description: param.description ?? param.name,
            schema: param.schema ?? { type: "string" },
          });
        }
      }

      // Add any path params found in the template but not in the spec
      for (const paramName of pathParamNames) {
        if (autoInjectedParams.has(paramName)) continue;
        if (handledPathParams.has(paramName)) continue;
        pathParams.push({
          name: paramName,
          description: `The ${paramName.replace(/_/g, " ")}`,
        });
      }

      // Request body
      let bodySchema: SchemaObject | null = null;
      if (operation.requestBody?.content) {
        for (const mediaType of Object.values(operation.requestBody.content)) {
          if (mediaType.schema) {
            bodySchema = mediaType.schema;
            break;
          }
        }
      }
      const bodyRequired = operation.requestBody?.required === true;

      tools.push({
        name,
        operationId: operation.operationId,
        method: method.toUpperCase(),
        pathTemplate,
        description,
        tags,
        pathParams,
        queryParams,
        bodySchema,
        bodyRequired,
      });
    }
  }

  // Sort by tool name so generated-file diffs are stable across spec re-downloads
  // that may shuffle path ordering.
  tools.sort((a, b) => a.name.localeCompare(b.name));

  return tools;
}

// ── Generate the tools registration file ────────────────────────────────────

function generateToolsFile(
  tools: ToolDef[],
  platform: "v1" | "v0",
): string {
  const lines: string[] = [
    '// Auto-generated — do not edit manually. Run `npm run generate` to regenerate.',
    'import { z } from "zod";',
    'import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";',
    'import { ApiClient } from "../client.js";',
    'import { ApiError } from "../types.js";',
    'import { applyRemap } from "../remap.js";',
    "",
    `export function register${platform === "v1" ? "V1" : "V0"}Tools(`,
    "  server: McpServer,",
    "  apiClient: ApiClient,",
    "): void {",
  ];

  for (const tool of tools) {
    try {
    const inputFields: string[] = [];
    // Per-tool map of sanitized key → original key. Populated as we walk the
    // body schema. Anything in here is renamed back to the original at
    // request-time via applyRemap.
    const remap = new Map<string, string>();

    // Path params as required string fields. Names are sanitized — agents see
    // the safe form; the handler maps back to the original at request time.
    for (const param of tool.pathParams) {
      const safeName = sanitizeKey(param.name);
      if (safeName !== param.name) recordRemap(remap, safeName, param.name);
      inputFields.push(
        `      ${JSON.stringify(safeName)}: z.string().describe("${escapeString(param.description.slice(0, 200))}")`,
      );
    }

    // Query params (same sanitization treatment as path params)
    for (const qp of tool.queryParams) {
      const safeName = sanitizeKey(qp.name);
      if (safeName !== qp.name) recordRemap(remap, safeName, qp.name);
      const zodType = jsonSchemaToZod(qp.schema, remap, 0);
      const opt = qp.required ? "" : ".optional()";
      inputFields.push(
        `      ${JSON.stringify(safeName)}: ${zodType}${opt}.describe("${escapeString(qp.description.slice(0, 200))}")`,
      );
    }

    // Request body — flatten one level if it's an object with properties.
    // If the entire body is optional per OpenAPI, every field is .optional()
    // regardless of its membership in the schema's `required` array.
    if (tool.bodySchema) {
      if (
        tool.bodySchema.type === "object" &&
        tool.bodySchema.properties &&
        Object.keys(tool.bodySchema.properties).length > 0
      ) {
        const requiredSet = new Set(tool.bodySchema.required ?? []);
        for (const [key, propSchema] of Object.entries(
          tool.bodySchema.properties,
        )) {
          if ((propSchema as SchemaObject).readOnly) continue;
          const safeKey = sanitizeKey(key);
          if (safeKey !== key) recordRemap(remap, safeKey, key);
          const zodType = jsonSchemaToZod(propSchema as SchemaObject, remap, 0);
          // Honor the field-level required[] regardless of requestBody.required.
          // Per OpenAPI semantics, required[] applies when the body is sent;
          // since MCP has no way to model "all-or-nothing on top-level args",
          // we choose the stricter interpretation. Tools whose body really is
          // optional-as-a-whole simply have an empty required[].
          const opt = requiredSet.has(key) ? "" : ".optional()";
          inputFields.push(`      ${JSON.stringify(safeKey)}: ${zodType}${opt}`);
        }
      } else {
        const inner = jsonSchemaToZod(tool.bodySchema, remap, 0);
        const opt = tool.bodyRequired ? "" : ".optional()";
        inputFields.push(`      body: ${inner}${opt}`);
      }
    }

    // Annotations
    const annotationParts: string[] = [];
    if (tool.method === "GET") annotationParts.push("readOnlyHint: true");
    if (tool.method === "DELETE") annotationParts.push("destructiveHint: true");

    // Build the path params mapping for the handler. Outgoing key is the
    // ORIGINAL spec name (the path template's `{placeholder}`); we read from
    // the SAFE name on the agent's params.
    const pathParamEntries = tool.pathParams
      .map(
        (p) =>
          `${p.name}: params[${JSON.stringify(sanitizeKey(p.name))}] as string`,
      )
      .join(", ");
    const pathParamsObj =
      pathParamEntries.length > 0
        ? `pathParams: { ${pathParamEntries} }`
        : "";

    // Build the query params mapping (same outgoing-vs-incoming key dance).
    const queryParamEntries = tool.queryParams
      .map(
        (qp) =>
          `${JSON.stringify(qp.name)}: params[${JSON.stringify(sanitizeKey(qp.name))}] as string | number | boolean | undefined`,
      )
      .join(", ");
    const queryParamsObj =
      queryParamEntries.length > 0
        ? `queryParams: { ${queryParamEntries} }`
        : "";

    // Build body — reconstruct the original body shape. Top-level keys are
    // restored statically (outgoing JSON key = original key, value read from
    // the sanitized key in params). Any nested renamed keys are restored at
    // runtime via applyRemap below.
    let bodyExpr = "";
    if (tool.bodySchema) {
      if (
        tool.bodySchema.type === "object" &&
        tool.bodySchema.properties &&
        Object.keys(tool.bodySchema.properties).length > 0
      ) {
        const bodyFields = Object.keys(tool.bodySchema.properties)
          .filter((k) => !(tool.bodySchema!.properties![k] as SchemaObject).readOnly)
          .map((k) => `${JSON.stringify(k)}: params[${JSON.stringify(sanitizeKey(k))}]`)
          .join(", ");
        bodyExpr = `body: { ${bodyFields} }`;
      } else {
        bodyExpr = "body: params.body";
      }
      if (remap.size > 0) {
        const remapObj = JSON.stringify(Object.fromEntries(remap));
        bodyExpr = `body: applyRemap(${bodyExpr.slice("body: ".length)}, ${remapObj})`;
      }
    }

    // Combine options
    const optionParts = [pathParamsObj, queryParamsObj, bodyExpr].filter(
      (s) => s.length > 0,
    );
    const optionsArg =
      optionParts.length > 0
        ? `, {\n        ${optionParts.join(",\n        ")},\n      }`
        : "";

    // Build the tool registration object properties
    const toolConfigParts: string[] = [];
    toolConfigParts.push(`      description: ${JSON.stringify(tool.description)}`);
    if (inputFields.length > 0) {
      toolConfigParts.push(`      inputSchema: {\n${inputFields.join(",\n")},\n      }`);
    } else {
      toolConfigParts.push(`      inputSchema: {}`);
    }
    if (annotationParts.length > 0) {
      toolConfigParts.push(`      annotations: { ${annotationParts.join(", ")} }`);
    }

    lines.push(`
  server.registerTool(
    ${JSON.stringify(tool.name)},
    {
${toolConfigParts.join(",\n")},
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          ${JSON.stringify(tool.method)},
          ${JSON.stringify(tool.pathTemplate)}${optionsArg},
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? \`API Error (\${error.statusCode}): \${error.code} - \${error.message}\`
            : \`Unexpected error: \${String(error)}\`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );`);
    } catch (err) {
      throw new Error(
        `While generating tool "${tool.name}" (${platform}): ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  lines.push("}");
  lines.push("");
  return lines.join("\n");
}

// ── Generate the registry file ──────────────────────────────────────────────

function generateRegistryFile(
  tools: ToolDef[],
  platform: "v1" | "v0",
): string {
  const varName = platform === "v1" ? "V1_TOOL_REGISTRY" : "V0_TOOL_REGISTRY";
  const entries = tools.map(
    (t) =>
      `  { name: ${JSON.stringify(t.name)}, description: ${JSON.stringify(t.description.slice(0, 300))}, tags: ${JSON.stringify(t.tags)}, method: ${JSON.stringify(t.method)}, pathTemplate: ${JSON.stringify(t.pathTemplate)} }`,
  );

  return [
    '// Auto-generated — do not edit manually. Run `npm run generate` to regenerate.',
    'import type { ToolMeta } from "../types.js";',
    "",
    `export const ${varName}: ToolMeta[] = [`,
    entries.join(",\n"),
    "];",
    "",
  ].join("\n");
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Loading v1 spec...");
  const v1Raw = readFileSync(resolve(ROOT, "openapi.yaml"), "utf-8");
  const v1Parsed = parseYaml(v1Raw);
  const v1Spec = (await $RefParser.dereference(v1Parsed)) as unknown as OpenApiSpec;

  console.log("Loading v0 spec...");
  const v0Raw = readFileSync(resolve(ROOT, "openapi-v0.yaml"), "utf-8");
  const v0Parsed = parseYaml(v0Raw);
  const v0Spec = (await $RefParser.dereference(v0Parsed)) as unknown as OpenApiSpec;

  console.log("Extracting v1 tools...");
  const v1Tools = extractTools(v1Spec, "v1");
  console.log(`  Found ${v1Tools.length} v1 tools`);

  console.log("Extracting v0 tools...");
  const v0Tools = extractTools(v0Spec, "v0");
  console.log(`  Found ${v0Tools.length} v0 tools`);

  // Apply hand-written description overrides
  console.log("Applying description overrides...");
  const v1Overrides: Record<string, string> = JSON.parse(
    readFileSync(resolve(ROOT, "descriptions/v1.json"), "utf-8"),
  );
  const v0Overrides: Record<string, string> = JSON.parse(
    readFileSync(resolve(ROOT, "descriptions/v0.json"), "utf-8"),
  );
  let v1Count = 0;
  for (const tool of v1Tools) {
    if (v1Overrides[tool.name]) {
      tool.description = v1Overrides[tool.name];
      v1Count++;
    }
  }
  let v0Count = 0;
  for (const tool of v0Tools) {
    if (v0Overrides[tool.name]) {
      tool.description = v0Overrides[tool.name];
      v0Count++;
    }
  }
  console.log(`  Applied ${v1Count} v1 overrides, ${v0Count} v0 overrides`);

  const outDir = resolve(ROOT, "src", "generated");

  console.log("Generating v1-tools.ts...");
  writeFileSync(resolve(outDir, "v1-tools.ts"), generateToolsFile(v1Tools, "v1"));

  console.log("Generating v1-registry.ts...");
  writeFileSync(resolve(outDir, "v1-registry.ts"), generateRegistryFile(v1Tools, "v1"));

  console.log("Generating v0-tools.ts...");
  writeFileSync(resolve(outDir, "v0-tools.ts"), generateToolsFile(v0Tools, "v0"));

  console.log("Generating v0-registry.ts...");
  writeFileSync(resolve(outDir, "v0-registry.ts"), generateRegistryFile(v0Tools, "v0"));

  console.log("Done!");
}

main().catch((err) => {
  console.error("Generation failed:", err);
  process.exit(1);
});

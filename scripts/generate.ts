import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import $RefParser from "@apidevtools/json-schema-ref-parser";

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
  bodyContentType: string;
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

function jsonSchemaToZod(schema: SchemaObject, depth: number = 0): string {
  if (depth > 5) return "z.any()";

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
      return jsonSchemaToZod(merged, depth);
    }
    return "z.any()";
  }

  // Handle oneOf/anyOf
  if (schema.oneOf || schema.anyOf) {
    const variants = (schema.oneOf ?? schema.anyOf)!;
    if (variants.length === 1) return jsonSchemaToZod(variants[0], depth + 1);
    if (variants.length >= 2) {
      const first = jsonSchemaToZod(variants[0], depth + 1);
      const second = jsonSchemaToZod(variants[1], depth + 1);
      let result = `z.union([${first}, ${second}`;
      for (let i = 2; i < variants.length; i++) {
        result += `, ${jsonSchemaToZod(variants[i], depth + 1)}`;
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
        ? jsonSchemaToZod(schema.items, depth + 1)
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
        const fieldZod = jsonSchemaToZod(propSchema, depth + 1);
        const isRequired = requiredSet.has(key);
        fields.push(
          `    ${JSON.stringify(key)}: ${fieldZod}${isRequired ? "" : ".optional()"}`,
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
      let bodyContentType = "application/json";
      if (operation.requestBody?.content) {
        for (const [ct, mediaType] of Object.entries(
          operation.requestBody.content,
        )) {
          if (mediaType.schema) {
            bodySchema = mediaType.schema;
            bodyContentType = ct;
            break;
          }
        }
      }

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
        bodyContentType,
      });
    }
  }

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
    "",
    `export function register${platform === "v1" ? "V1" : "V0"}Tools(`,
    "  server: McpServer,",
    "  apiClient: ApiClient,",
    "): void {",
  ];

  for (const tool of tools) {
    const inputFields: string[] = [];

    // Path params as required string fields
    for (const param of tool.pathParams) {
      inputFields.push(
        `      ${JSON.stringify(param.name)}: z.string().describe("${escapeString(param.description.slice(0, 200))}")`,
      );
    }

    // Query params
    for (const qp of tool.queryParams) {
      const zodType = jsonSchemaToZod(qp.schema, 0);
      const opt = qp.required ? "" : ".optional()";
      inputFields.push(
        `      ${JSON.stringify(qp.name)}: ${zodType}${opt}.describe("${escapeString(qp.description.slice(0, 200))}")`,
      );
    }

    // Request body — flatten one level if it's an object with properties
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
          const zodType = jsonSchemaToZod(propSchema as SchemaObject, 0);
          const opt = requiredSet.has(key) ? "" : ".optional()";
          inputFields.push(`      ${JSON.stringify(key)}: ${zodType}${opt}`);
        }
      } else {
        inputFields.push(
          `      body: ${jsonSchemaToZod(tool.bodySchema, 0)}`,
        );
      }
    }

    // Annotations
    const annotationParts: string[] = [];
    if (tool.method === "GET") annotationParts.push("readOnlyHint: true");
    if (tool.method === "DELETE") annotationParts.push("destructiveHint: true");

    // Build the path params mapping for the handler
    const pathParamEntries = tool.pathParams
      .map((p) => `${p.name}: params[${JSON.stringify(p.name)}] as string`)
      .join(", ");
    const pathParamsObj =
      pathParamEntries.length > 0
        ? `pathParams: { ${pathParamEntries} }`
        : "";

    // Build the query params mapping
    const queryParamEntries = tool.queryParams
      .map(
        (qp) =>
          `${JSON.stringify(qp.name)}: params[${JSON.stringify(qp.name)}] as string | number | boolean | undefined`,
      )
      .join(", ");
    const queryParamsObj =
      queryParamEntries.length > 0
        ? `queryParams: { ${queryParamEntries} }`
        : "";

    // Build body — reconstruct the original body shape
    let bodyExpr = "";
    if (tool.bodySchema) {
      if (
        tool.bodySchema.type === "object" &&
        tool.bodySchema.properties &&
        Object.keys(tool.bodySchema.properties).length > 0
      ) {
        const bodyFields = Object.keys(tool.bodySchema.properties)
          .filter((k) => !(tool.bodySchema!.properties![k] as SchemaObject).readOnly)
          .map((k) => `${JSON.stringify(k)}: params[${JSON.stringify(k)}]`)
          .join(", ");
        bodyExpr = `body: { ${bodyFields} }`;
      } else {
        bodyExpr = "body: params.body";
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

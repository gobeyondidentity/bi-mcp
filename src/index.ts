#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { ApiClient } from "./client.js";
import { registerSearchTool } from "./search.js";
import { registerV1Tools } from "./generated/v1-tools.js";
import { registerV0Tools } from "./generated/v0-tools.js";
import { V1_TOOL_REGISTRY } from "./generated/v1-registry.js";
import { V0_TOOL_REGISTRY } from "./generated/v0-registry.js";

const config = loadConfig();
const apiClient = new ApiClient(config);

const platformLabel =
  config.platform === "v1" ? "Secure Access" : "Secure Workforce";

// Log to stderr so it doesn't interfere with MCP stdio protocol
console.error(
  `[beyond-identity-mcp] Detected platform: ${platformLabel} (${config.platform}), region: ${config.region}, tenant: ${config.tenantId}`,
);
if (process.env.BASE_URL) {
  console.error(`[beyond-identity-mcp] BASE_URL override: ${config.baseUrl}`);
}

const registry = config.platform === "v1" ? V1_TOOL_REGISTRY : V0_TOOL_REGISTRY;

const server = new McpServer(
  { name: "beyond-identity", version: "1.0.0" },
  {
    instructions: `This MCP server provides tools for managing Beyond Identity ${platformLabel} resources. Use the 'search_tools' tool to discover available operations. ${
      config.platform === "v1"
        ? "Most tools require a realm_id parameter — call 'list_realms' first to discover available realms."
        : ""
    }`,
  },
);

registerSearchTool(server, registry);

if (config.platform === "v1") {
  registerV1Tools(server, apiClient);
} else {
  registerV0Tools(server, apiClient);
}

const transport = new StdioServerTransport();
await server.connect(transport);

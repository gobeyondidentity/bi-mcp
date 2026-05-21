import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApiClient } from "./client.js";
import { registerSearchTool } from "./search.js";
import { registerV1Tools } from "./generated/v1-tools.js";
import { registerV0Tools } from "./generated/v0-tools.js";
import { V1_TOOL_REGISTRY } from "./generated/v1-registry.js";
import { V0_TOOL_REGISTRY } from "./generated/v0-registry.js";
import type { Config } from "./types.js";

/**
 * Build a fully-configured McpServer for a single tenant context.
 *
 * Used by both stdio mode (one server for the process) and HTTP mode (one
 * server per incoming session). All tool registration is bound to the
 * Config passed in, so per-session isolation is just "construct a new
 * server per session."
 */
export function createServer(config: Config): McpServer {
  const platformLabel =
    config.platform === "v1" ? "Secure Access" : "Secure Workforce";
  const registry =
    config.platform === "v1" ? V1_TOOL_REGISTRY : V0_TOOL_REGISTRY;

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

  const apiClient = new ApiClient(config);
  registerSearchTool(server, registry);
  if (config.platform === "v1") {
    registerV1Tools(server, apiClient);
  } else {
    registerV0Tools(server, apiClient);
  }

  return server;
}

#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { createServer } from "./server.js";
import { startHttpServer } from "./http.js";

async function runStdio(): Promise<void> {
  const config = loadConfig();
  const platformLabel =
    config.platform === "v1" ? "Secure Access" : "Secure Workforce";

  // Log to stderr so it doesn't interfere with MCP stdio protocol
  console.error(
    `[beyond-identity-mcp] Detected platform: ${platformLabel} (${config.platform}), region: ${config.region}, tenant: ${config.tenantId}`,
  );
  if (process.env.BASE_URL) {
    console.error(
      `[beyond-identity-mcp] BASE_URL override: ${config.baseUrl}`,
    );
  }

  const server = createServer(config);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

async function runHttp(): Promise<void> {
  const portRaw = process.env.PORT ?? "3000";
  const port = Number.parseInt(portRaw, 10);
  if (!Number.isFinite(port) || port <= 0 || port > 65535) {
    throw new Error(
      `PORT must be a number between 1 and 65535 (got ${JSON.stringify(portRaw)})`,
    );
  }

  await startHttpServer({
    port,
    host: process.env.HOST,
    baseUrl: process.env.BASE_URL,
    defaultRegion: process.env.REGION,
    path: process.env.MCP_PATH,
  });
}

const transportMode = (process.env.MCP_TRANSPORT ?? "stdio").toLowerCase();

if (transportMode === "http") {
  await runHttp();
} else if (transportMode === "stdio") {
  await runStdio();
} else {
  console.error(
    `[beyond-identity-mcp] Unknown MCP_TRANSPORT="${process.env.MCP_TRANSPORT}" (expected "stdio" or "http")`,
  );
  process.exit(1);
}

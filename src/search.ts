import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ToolMeta, Platform } from "./types.js";

const STOP_WORDS = new Set([
  "the", "a", "an", "to", "how", "do", "i", "can", "is", "it",
  "in", "of", "for", "and", "or", "on", "with", "from", "by", "my",
  "what", "which", "that", "this", "me", "we", "all",
]);

const VERB_METHOD_MAP: Record<string, string> = {
  create: "POST",
  add: "POST",
  make: "POST",
  new: "POST",
  delete: "DELETE",
  remove: "DELETE",
  revoke: "DELETE",
  destroy: "DELETE",
  list: "GET",
  get: "GET",
  show: "GET",
  find: "GET",
  fetch: "GET",
  read: "GET",
  view: "GET",
  search: "GET",
  update: "PATCH",
  edit: "PATCH",
  modify: "PATCH",
  change: "PATCH",
  set: "PATCH",
  patch: "PATCH",
};

const SYNONYMS_COMMON: Record<string, string[]> = {
  user: ["identity", "user"],
  identity: ["identity", "user"],
  member: ["identity", "user", "member"],
  app: ["application"],
  application: ["application", "app"],
  idp: ["identity_provider", "identity-provider"],
  sso: ["sso_config", "sso-config"],
  permission: ["role", "scope"],
  role: ["role", "permission"],
  scope: ["scope", "role"],
  auth: ["authenticator"],
  authenticator: ["authenticator", "auth"],
  cred: ["credential", "passkey"],
  credential: ["credential", "passkey"],
  passkey: ["passkey", "credential"],
  binding: ["credential_binding", "binding"],
};

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9_\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 0 && !STOP_WORDS.has(t));
}

function expandTokens(tokens: string[]): string[] {
  const expanded = new Set(tokens);
  for (const token of tokens) {
    const synonyms = SYNONYMS_COMMON[token];
    if (synonyms) {
      for (const syn of synonyms) {
        expanded.add(syn);
      }
    }
  }
  return Array.from(expanded);
}

function scoreTool(tool: ToolMeta, tokens: string[]): number {
  let score = 0;
  const nameLower = tool.name.toLowerCase();
  const descLower = tool.description.toLowerCase();
  const tagsLower = tool.tags.map((t) => t.toLowerCase());

  for (const token of tokens) {
    // Exact match in tool name parts
    if (nameLower.split("_").includes(token)) {
      score += 3;
    } else if (nameLower.includes(token)) {
      score += 2;
    }

    // Match in tags
    for (const tag of tagsLower) {
      if (tag.includes(token)) {
        score += 2;
        break;
      }
    }

    // Substring in description
    if (descLower.includes(token)) {
      score += 1;
    }

    // CRUD verb → HTTP method bonus
    const expectedMethod = VERB_METHOD_MAP[token];
    if (expectedMethod && tool.method === expectedMethod) {
      score += 1;
    }
  }

  return score;
}

export function searchTools(
  registry: ToolMeta[],
  query: string,
): Array<{ name: string; description: string; tags: string[] }> {
  const tokens = tokenize(query);
  if (tokens.length === 0) {
    // Return all tools if no meaningful query
    return registry.map(({ name, description, tags }) => ({
      name,
      description,
      tags,
    }));
  }

  const expanded = expandTokens(tokens);

  const scored = registry
    .map((tool) => ({ tool, score: scoreTool(tool, expanded) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return scored.map(({ tool }) => ({
    name: tool.name,
    description: tool.description,
    tags: tool.tags,
  }));
}

export function registerSearchTool(
  server: McpServer,
  registry: ToolMeta[],
): void {
  server.registerTool(
    "search_tools",
    {
      description:
        "Search all available Beyond Identity API tools by keyword or natural language query. Use this to discover which tools are available for a task. Example queries: 'add user to group', 'list applications', 'manage SSO'.",
      inputSchema: {
        query: z
          .string()
          .describe(
            "Natural language search query, e.g. 'add user to group' or 'list applications'",
          ),
      },
    },
    async ({ query }) => {
      const results = searchTools(registry, query);
      if (results.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No tools found matching "${query}". Try broader terms or different keywords.`,
            },
          ],
        };
      }
      return {
        content: [{ type: "text" as const, text: JSON.stringify(results, null, 2) }],
      };
    },
  );
}

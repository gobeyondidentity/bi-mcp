// Tools that are deliberately NOT registered on the MCP server even though
// they appear in the upstream OpenAPI spec. Add an entry here when an
// endpoint is known-broken server-side and exposing it just leads agents
// into 404s. Remove the entry once the server side is fixed.
//
// Each excluded name must be the post-camelCase-to-snake_case operationId
// (i.e. the tool name as it would appear in the generated registry).

export const EXCLUDED_TOOLS: Record<"v1" | "v0", ReadonlySet<string>> = {
  v1: new Set([
    // Both endpoints return 404 against rolling AND staging — confirmed
    // server-side bug, not a spec/path issue from this side. Filed with the
    // server team. Re-enable (delete these lines + regenerate) once the
    // endpoints are confirmed live.
    "sso_is_group_assigned",
    "identity_to_sso_config_check",
  ]),
  v0: new Set<string>(),
};

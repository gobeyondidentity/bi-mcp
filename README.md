# @beyondidentity/mcp

An MCP (Model Context Protocol) server that gives AI agents direct access to the Beyond Identity API — no admin panel required. Agents can manage identities, groups, applications, SSO configurations, credentials, and every other Beyond Identity resource through natural tool calls.

The server auto-detects which Beyond Identity platform you're using from your API key and registers the appropriate tools:

- **Secure Access** (v1): 104 tools for the modern platform
- **Secure Workforce** (v0): 35 tools for the legacy platform

Two deployment modes are supported:

- **stdio** (default) — one MCP process per tenant on the user's machine. Configured via `npx` or a local clone. See [Quick Start](#quick-start).
- **Hosted (HTTP)** — one MCP server hosted centrally; clients connect via streamable HTTP with a per-session API token. See [Hosted (HTTP) Mode](#hosted-http-mode).

## Quick Start

Add the server to your MCP client configuration:

```json
{
  "mcpServers": {
    "beyondidentity": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@beyondidentity/mcp"],
      "env": {
        "API_KEY": "your-jwt-api-key"
      }
    }
  }
}
```

For EU region tenants:

```json
{
  "mcpServers": {
    "beyondidentity": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@beyondidentity/mcp"],
      "env": {
        "API_KEY": "your-jwt-api-key",
        "REGION": "EU"
      }
    }
  }
}
```

That's it. The server extracts your tenant ID from the JWT and determines the correct platform and base URL automatically.

## Environment Variables

| Variable | Mode | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `API_KEY` | stdio | Yes | — | Beyond Identity API key (JWT). Obtained from the admin console under Settings > API Access. Ignored in HTTP mode (each session brings its own token). |
| `REGION` | both | No | `US` | `US` or `EU`. In stdio mode, sets the API base URL. In HTTP mode, sets the default region when a request doesn't supply `X-BI-Region`. |
| `BASE_URL` | both | No | — | Override the API base URL (useful for staging / local dev). Applies to every session in HTTP mode. |
| `MCP_TRANSPORT` | both | No | `stdio` | `stdio` or `http`. Selects which transport the entry point launches. |
| `PORT` | http | No | `3000` | HTTP listen port. |
| `HOST` | http | No | `0.0.0.0` | HTTP listen interface. |
| `MCP_PATH` | http | No | `/mcp` | URL path the MCP endpoint is served at. |

## Hosted (HTTP) Mode

Instead of every customer running a local stdio process, the same server can be hosted centrally and reached over streamable HTTP. Each incoming session brings its own Beyond Identity API key in an `Authorization: Bearer` header; the server constructs a per-session `Config` from that token (no shared process-level credential).

### Per-session auth flow

1. Client makes a `POST /mcp` with `Authorization: Bearer <api-key>` and a JSON-RPC `initialize` body. No `Mcp-Session-Id` header on this first call.
2. Server validates the JWT, builds a per-session `Config` (platform, tenant, region, base URL), registers the appropriate tool set, mints a new session ID, and returns it as the `Mcp-Session-Id` response header.
3. Client includes `Mcp-Session-Id: <id>` on every subsequent request for the lifetime of the session.
4. Client sends `DELETE /mcp` with the session ID to terminate, or the server cleans up on transport close.

### Per-request headers

| Header | When | Description |
|--------|------|-------------|
| `Authorization: Bearer <jwt>` | Initialize only | The API key. Required on the initialize POST; ignored on subsequent requests (the session is already bound). |
| `Mcp-Session-Id: <id>` | All non-initialize requests | The session ID returned by the initialize response. Server returns 404 `unknown_session` for unknown IDs. |
| `X-BI-Region: US\|EU` | Initialize only | Overrides the server's default region for this session. |
| `Accept: application/json, text/event-stream` | All requests | Required by the MCP streamable HTTP spec — server picks the best response format. |

### Running locally

```sh
npm install --ignore-scripts
npm run build              # generate tool code + compile
npm run dev:http           # MCP_TRANSPORT=http tsx src/index.ts

# → [beyond-identity-mcp] HTTP transport listening on http://0.0.0.0:3000/mcp
```

Or with a different port / staging base URL:

```sh
MCP_TRANSPORT=http \
PORT=8080 \
BASE_URL=https://staging-api.example.com \
  npx tsx src/index.ts
```

### Local curl walkthrough

```sh
# 0. Set your API key once for easy reuse
TOKEN="eyJhbGc...your-api-key-jwt..."

# 1. Initialize — note the response Mcp-Session-Id header
curl -i -X POST http://localhost:3000/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "id": 1,
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {"name": "curl", "version": "1.0"}
    }
  }'
# → 200 OK, Mcp-Session-Id: <uuid>

# 2. Capture the session ID
SESSION_ID="<paste from above>"

# 3. Send the required initialized notification
curl -s -X POST http://localhost:3000/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "Mcp-Session-Id: $SESSION_ID" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","method":"notifications/initialized"}'

# 4. List the registered tools
curl -s -X POST http://localhost:3000/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "Mcp-Session-Id: $SESSION_ID" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":2}'

# 5. Call a tool (e.g., search_tools to find what's available)
curl -s -X POST http://localhost:3000/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "Mcp-Session-Id: $SESSION_ID" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "id": 3,
    "params": {"name": "search_tools", "arguments": {"query": "list users"}}
  }'

# 6. Terminate the session
curl -s -X DELETE http://localhost:3000/mcp \
  -H "Mcp-Session-Id: $SESSION_ID"
```

### Connecting Claude Code (HTTP)

Point Claude Code at the local HTTP endpoint. The exact config field shape may vary by Claude Code version — verify against current docs.

```json
{
  "mcpServers": {
    "beyondidentity-http": {
      "type": "http",
      "url": "http://localhost:3000/mcp",
      "headers": {
        "Authorization": "Bearer eyJhbGc...your-api-key-jwt..."
      }
    }
  }
}
```

### Testing

```sh
npm test
```

Runs the Node test suite under `tests/`. Covers JWT parsing, region routing, validation, all HTTP error paths, and the streamable-HTTP initialize happy path for both v0 and v1 platforms — no real Beyond Identity tenant required (tests use synthetic JWTs).

## How It Works

### Platform Detection

The server inspects your JWT at startup to determine which platform to target:

- If the token contains a `bi_t` claim, you're on **Secure Access (v1)**. The `bi_t` value is your tenant ID, and the server hits `api-us.beyondidentity.com` or `api-eu.beyondidentity.com`.
- If there is no `bi_t` claim, the server falls back to the `sub` claim and targets **Secure Workforce (v0)** at `api.byndid.com` or `api-eu.byndid.com`.

Only one set of tools is registered per session. Agents never see version numbers or need to think about which platform they're on.

### Tool Discovery

With 100+ possible tools, agents need a way to find the right one. The `search_tools` tool accepts a natural language query and returns the most relevant tools:

```
search_tools("add a user to a group")
→ add_group_members, create_identity, list_groups, ...
```

It uses keyword matching, synonym expansion (`user` matches `identity`, `app` matches `application`, `cred` matches `credential`/`passkey`), and CRUD verb detection (`create` matches POST endpoints, `delete` matches DELETE endpoints).

### Automatic Parameter Injection

On the v1 platform, every API path looks like `/v1/tenants/{tenant_id}/realms/{realm_id}/...`. The server injects `tenant_id` automatically from the JWT — agents never provide it. The `realm_id` is a required parameter on realm-scoped tools; agents call `list_realms` first to discover available realms.

On v0, paths are simpler (`/v2/...`) with no tenant or realm in the URL — the token handles tenant scoping.

### Error Handling

The server validates your API key at startup with clear messages for common problems:

- Not a JWT (wrong segment count)
- Corrupted payload (bad base64 or invalid JSON)
- Missing expected claims (`bi_t` or `sub`)
- Invalid region value

At runtime, API errors are returned as structured tool results with HTTP status codes and error details, not thrown as exceptions that crash the conversation.

## Available Tools

### Secure Access (v1) — 104 tools

<details>
<summary><strong>Tenants</strong> (2)</summary>

| Tool | Description |
|------|-------------|
| `get_tenant` | Retrieve an existing tenant |
| `update_tenant` | Patch a tenant |
</details>

<details>
<summary><strong>Realms</strong> (5)</summary>

| Tool | Description |
|------|-------------|
| `list_realms` | List realms for a tenant |
| `create_realm` | Create a new realm |
| `get_realm` | Retrieve an existing realm |
| `update_realm` | Patch a realm |
| `delete_realm` | Delete a realm |
</details>

<details>
<summary><strong>Groups</strong> (9)</summary>

| Tool | Description |
|------|-------------|
| `list_groups` | List groups for a realm |
| `create_group` | Create a new group |
| `get_group` | Retrieve an existing group |
| `update_group` | Patch a group |
| `delete_group` | Delete a group |
| `add_group_members` | Add members to a group |
| `delete_group_members` | Delete members from a group |
| `list_group_members` | List members for a group |
| `list_group_roles` | List role memberships for a group |
</details>

<details>
<summary><strong>Identities</strong> (8)</summary>

| Tool | Description |
|------|-------------|
| `list_identities` | List identities for a realm |
| `create_identity` | Create a new identity |
| `get_identity` | Retrieve an existing identity |
| `update_identity` | Patch an identity |
| `delete_identity` | Delete an identity |
| `batch_delete_identities` | Batch delete identities |
| `list_identity_groups` | List group memberships for an identity |
| `list_identity_roles` | List role memberships for an identity |
</details>

<details>
<summary><strong>Roles</strong> (11)</summary>

| Tool | Description |
|------|-------------|
| `list_roles` | List roles for a resource server |
| `create_role` | Create a new role |
| `get_role` | Retrieve an existing role |
| `update_role` | Patch a role |
| `delete_role` | Delete a role |
| `add_role_members` | Assign members to a role |
| `delete_role_members` | Unassign members from a role |
| `list_role_members` | List members for a role |
| `add_role_scopes` | Assign scopes to a role |
| `delete_role_scopes` | Unassign scopes from a role |
| `list_role_scopes` | List scopes for a role |
</details>

<details>
<summary><strong>Credentials</strong> (3)</summary>

| Tool | Description |
|------|-------------|
| `list_credentials` | List credentials for an identity |
| `get_credential` | Retrieve an existing credential |
| `revoke_credential` | Revoke a credential |
</details>

<details>
<summary><strong>Credential Binding Jobs</strong> (7)</summary>

| Tool | Description |
|------|-------------|
| `list_credential_binding_jobs` | List credential binding jobs for an identity |
| `create_credential_binding_job` | Create a new credential binding job |
| `get_credential_binding_job` | Retrieve an existing credential binding job |
| `set_credential_binding_job_revoked` | Revoke an active credential binding job |
| `create_batch_credential_binding_job` | Create a new batch credential binding job |
| `get_batch_credential_binding_job` | Retrieve an existing batch credential binding job |
| `list_batch_credential_binding_job_results` | List results of a batch credential binding job |
</details>

<details>
<summary><strong>Themes</strong> (4)</summary>

| Tool | Description |
|------|-------------|
| `create_theme` | Create a new theme |
| `get_active_theme` | Get the active theme |
| `get_theme` | Retrieve an existing theme |
| `update_theme` | Patch a theme |
</details>

<details>
<summary><strong>Applications</strong> (5)</summary>

| Tool | Description |
|------|-------------|
| `list_applications` | List applications for a realm |
| `create_application` | Create a new application |
| `get_application` | Retrieve an existing application |
| `update_application` | Patch an application |
| `delete_application` | Delete an application |
</details>

<details>
<summary><strong>Authenticator Configurations</strong> (5)</summary>

| Tool | Description |
|------|-------------|
| `list_authenticator_configs` | List authenticator configurations for a realm |
| `create_authenticator_config` | Create a new authenticator configuration |
| `get_authenticator_config` | Retrieve an existing authenticator configuration |
| `update_authenticator_config` | Patch an authenticator configuration |
| `delete_authenticator_config` | Delete an authenticator configuration |
</details>

<details>
<summary><strong>Resource Servers</strong> (5)</summary>

| Tool | Description |
|------|-------------|
| `list_resource_servers` | List resource servers for a realm |
| `create_resource_server` | Create a new resource server |
| `get_resource_server` | Retrieve an existing resource server |
| `update_resource_server` | Patch a resource server |
| `delete_resource_server` | Delete a resource server |
</details>

<details>
<summary><strong>Tokens</strong> (2)</summary>

| Tool | Description |
|------|-------------|
| `list_tokens` | List tokens |
| `revoke_token` | Revoke a token |
</details>

<details>
<summary><strong>SSO Configs</strong> (17)</summary>

| Tool | Description |
|------|-------------|
| `list_sso_configs` | List SSO configs for a realm |
| `create_sso_config` | Create a new SSO config |
| `get_sso_config` | Retrieve an existing SSO config |
| `update_sso_config` | Update an SSO config |
| `delete_sso_config` | Delete an SSO config |
| `add_identities_to_sso_config` | Associate identities with an SSO config |
| `delete_identities_from_sso_config` | Delete identities from an SSO config |
| `list_identities_for_sso_config` | List identities associated with an SSO config |
| `identity_to_sso_config_check` | Check if an identity is assigned to an SSO config |
| `list_sso_configs_for_identity` | List SSO configs associated with an identity |
| `add_groups_to_sso_config` | Associate groups with an SSO config |
| `delete_groups_from_sso_config` | Delete groups from an SSO config |
| `list_groups_for_sso_config` | List groups associated with an SSO config |
| `list_sso_configs_for_group` | List SSO configs associated with a group |
| `sso_is_group_assigned` | Check if groups are associated with an SSO config |
| `application_id_to_sso_config_id` | Get the SSO config ID for an application |
| `test_sso_config` | Test an SSO config |
</details>

<details>
<summary><strong>Identity Providers</strong> (5)</summary>

| Tool | Description |
|------|-------------|
| `list_identity_providers` | List identity providers by realm |
| `create_identity_provider` | Create a new identity provider |
| `get_identity_provider` | Retrieve an identity provider |
| `update_identity_provider` | Update an identity provider |
| `delete_identity_provider` | Delete an identity provider |
</details>

<details>
<summary><strong>Launch Mechanisms</strong> (2)</summary>

| Tool | Description |
|------|-------------|
| `get_flow_type_config` | Get flow type configuration |
| `update_flow_type_config` | Update flow type configuration |
</details>

<details>
<summary><strong>SCIM</strong> (14)</summary>

| Tool | Description |
|------|-------------|
| `scim_list_users` | List all SCIM users |
| `scim_create_user` | Create a new SCIM user |
| `scim_get_user` | Retrieve an existing SCIM user |
| `scim_replace_user` | Replace a SCIM user |
| `scim_update_user` | Patch a SCIM user |
| `scim_delete_user` | Delete a SCIM user |
| `scim_list_groups` | List all SCIM groups |
| `scim_create_group` | Create a new SCIM group |
| `scim_get_group` | Retrieve an existing SCIM group |
| `scim_update_group` | Patch a SCIM group |
| `scim_delete_group` | Delete a SCIM group |
| `list_resource_types` | List all SCIM resource types |
| `list_schemas` | List all SCIM schemas |
| `get_service_provider_config` | Retrieve the SCIM service provider configuration |
</details>

### Secure Workforce (v0) — 35 tools

<details>
<summary><strong>Groups</strong> (8)</summary>

| Tool | Description |
|------|-------------|
| `list_groups` | List all groups for a tenant |
| `create_group` | Create a new group |
| `get_groups` | Retrieve an existing group |
| `update_group` | Patch a group |
| `delete_group` | Delete a group |
| `list_group_users` | List all users for a group |
| `add_group_users` | Add users to a group |
| `delete_group_users` | Delete users from a group |
</details>

<details>
<summary><strong>Users</strong> (6)</summary>

| Tool | Description |
|------|-------------|
| `list_users` | List all users for a tenant |
| `create_user` | Create a new user |
| `get_user` | Retrieve an existing user |
| `update_user` | Update a user |
| `delete_user` | Delete a user |
| `list_user_groups` | List all groups for a user |
</details>

<details>
<summary><strong>Binding Jobs</strong> (2)</summary>

| Tool | Description |
|------|-------------|
| `create_binding_job` | Create a new credential binding job |
| `get_binding_job` | Get a credential binding job |
</details>

<details>
<summary><strong>Passkeys</strong> (4)</summary>

| Tool | Description |
|------|-------------|
| `list_passkeys` | List passkeys |
| `delete_passkey` | Delete a passkey |
| `list_passkey_tags` | List passkey tags |
| `set_passkey_tags` | Set passkey tags |
</details>

<details>
<summary><strong>Certificate Authority</strong> (1)</summary>

| Tool | Description |
|------|-------------|
| `retire_tenant_issuer` | Retire the intermediate tenant certificate |
</details>

<details>
<summary><strong>SCIM</strong> (14)</summary>

| Tool | Description |
|------|-------------|
| `scim_list_users` | List all SCIM users |
| `scim_create_user` | Create a new SCIM user |
| `scim_get_user` | Retrieve an existing SCIM user |
| `scim_replace_user` | Replace a SCIM user |
| `scim_update_user` | Patch a SCIM user |
| `scim_delete_user` | Delete a SCIM user |
| `scim_list_groups` | List all SCIM groups |
| `scim_create_group` | Create a new SCIM group |
| `scim_get_group` | Retrieve an existing SCIM group |
| `scim_update_group` | Patch a SCIM group |
| `scim_delete_group` | Delete a SCIM group |
| `list_resource_types` | List all SCIM resource types |
| `list_schemas` | List all SCIM schemas |
| `get_service_provider_config` | Retrieve the SCIM service provider configuration |
</details>

## Project Architecture

```
bi-mcp/
├── openapi.yaml              # Secure Access (v1) OpenAPI spec
├── openapi-v0.yaml           # Secure Workforce (v0) OpenAPI spec
├── package.json
├── tsconfig.json
├── scripts/
│   └── generate.ts           # Reads both specs, emits tool code
├── src/
│   ├── index.ts              # Entry point — detects platform, registers tools
│   ├── config.ts             # JWT validation, platform detection, region routing
│   ├── client.ts             # HTTP client with auth and path param injection
│   ├── search.ts             # search_tools implementation
│   ├── types.ts              # Shared types (Platform, Region, Config, ApiError, ToolMeta)
│   └── generated/            # Auto-generated — do not edit
│       ├── v1-tools.ts       # 104 Secure Access tool registrations
│       ├── v1-registry.ts    # Tool metadata for v1 search
│       ├── v0-tools.ts       # 35 Secure Workforce tool registrations
│       └── v0-registry.ts    # Tool metadata for v0 search
└── dist/                     # Compiled JS (gitignored)
```

### Code Generation

All tool definitions and HTTP handlers are auto-generated from the OpenAPI specifications. The generator (`scripts/generate.ts`) does the following:

1. Parses both YAML specs and dereferences all `$ref` pointers
2. Extracts every operation (path + HTTP method + operationId)
3. Converts each `operationId` to a `snake_case` tool name
4. Builds [Zod](https://zod.dev/) input schemas from the OpenAPI request parameters and body definitions
5. Generates tool handler functions that call the `ApiClient` with the correct method, path, and parameters
6. Annotates read-only tools (`GET`) and destructive tools (`DELETE`) for MCP clients that surface this information

To regenerate after spec changes:

```sh
npm run generate
```

The generated files are committed to the repository so consumers don't need to run the generator themselves.

### HTTP Client

The `ApiClient` class (`src/client.ts`) handles:

- **Bearer token authentication** on every request
- **Path parameter substitution** — replaces `{tenant_id}`, `{realm_id}`, `{identity_id}`, etc. in URL templates
- **Tenant ID injection** — on v1, the tenant ID from the JWT is inserted into every path automatically
- **Query parameter serialization** — optional params are omitted, not sent as empty strings
- **Error normalization** — HTTP errors are caught and returned as structured `ApiError` objects with status code, error code, and message

## Development

```sh
# Install dependencies
npm install --ignore-scripts

# Download fresh OpenAPI specs
curl -s https://developer.beyondidentity.com/api/v1/openapi.yaml -o openapi.yaml
curl -s https://docs.beyondidentity.com/api/v0/openapi.yaml -o openapi-v0.yaml

# Regenerate tool code from specs
npm run generate

# Type-check
npx tsc --noEmit

# Full build (generate + compile)
npm run build

# Run in development mode (stdio)
API_KEY="your-key" npm run dev

# Run in development mode (HTTP — no API_KEY env var needed; per-session)
npm run dev:http

# Run compiled build
API_KEY="your-key" npm start

# Run the test suite
npm test
```

## API Documentation

- [Secure Access (v1) API Reference](https://developer.beyondidentity.com/api/v1)
- [Secure Workforce (v0) API Reference](https://docs.beyondidentity.com/api/v0)

## Local Development MCP Config

To use a local clone of this repo instead of the published npm package, point your MCP client at the TypeScript source directly:

```json
{
  "mcpServers": {
    "beyondidentity": {
      "type": "stdio",
      "command": "npx",
      "args": ["tsx", "/path/to/bi-mcp/src/index.ts"],
      "env": {
        "API_KEY": "your-jwt-api-key"
      }
    }
  }
}
```

This runs the server from source via `tsx` — no build step required. Changes to `src/` take effect immediately on the next MCP session. To point at a non-production environment, add `BASE_URL`:

```json
{
  "mcpServers": {
    "beyondidentity": {
      "type": "stdio",
      "command": "npx",
      "args": ["tsx", "/path/to/bi-mcp/src/index.ts"],
      "env": {
        "API_KEY": "your-jwt-api-key",
        "BASE_URL": "http://localhost:8021"
      }
    }
  }
}
```

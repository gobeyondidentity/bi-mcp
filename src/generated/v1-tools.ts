// Auto-generated — do not edit manually. Run `npm run generate` to regenerate.
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApiClient } from "../client.js";
import { ApiError } from "../types.js";

export function registerV1Tools(
  server: McpServer,
  apiClient: ApiClient,
): void {

  server.registerTool(
    "get_tenant",
    {
      description: "Retrieve the tenant associated with your API key. Returns the tenant object with id, display_name, create_time, and update_time. This is a read-only operation. The tenant_id is automatically injected from your JWT — you do not need to provide it.",
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}",
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "update_tenant",
    {
      description: "Update attributes of your tenant (e.g. display_name). Uses PATCH semantics — omitted fields are left unchanged, read-only fields are ignored. Rejects unknown fields with a 400 error. Returns the updated tenant object.",
      inputSchema: {
      "tenant": z.object({
    "display_name": z.string().describe("A human-readable name for the tenant. This name is used for display purposes.\n").optional(),
  }).describe("A tenant represents an organization in the Beyond Identity Cloud. Tenants contain all data necessary for that organization to operate.\n"),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "PATCH",
          "/v1/tenants/{tenant_id}", {
        body: { "tenant": params["tenant"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "list_realms",
    {
      description: "List all realms within your tenant. Returns an array of realm objects with pagination (page_size max 200, default 20). Use this first to discover realm_ids needed by most other tools. Page tokens expire after 1 week.",
      inputSchema: {
      "page_size": z.number().optional().describe("Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed b"),
      "page_token": z.string().optional().describe("Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"),
      "skip": z.number().optional().describe("Number of items to skip. This is the zero-based index of the first result.\n"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms", {
        queryParams: { "page_size": params["page_size"] as string | number | boolean | undefined, "page_token": params["page_token"] as string | number | boolean | undefined, "skip": params["skip"] as string | number | boolean | undefined },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "create_realm",
    {
      description: "Create a new administrative realm within your tenant. Requires a display_name. Returns the new realm object with an auto-generated id. Returns 409 if a realm with the same name already exists.",
      inputSchema: {
      "realm": z.object({
    "display_name": z.string().describe("A human-readable name for the realm. This name is used for display purposes.\n").optional(),
    "classification": z.string().describe("Classification of the realm. Can be either SECURE_WORFORCE or SECURE_CUSTOMER").optional(),
  }).describe("A realm is a unique administrative domain within a tenant. Realms may be used to define multiple development environments or for isolated administrative domains.\n"),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v1/tenants/{tenant_id}/realms", {
        body: { "realm": params["realm"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "get_realm",
    {
      description: "Retrieve a specific realm by realm_id. Returns the realm object with id, display_name, create_time, and update_time. Use list_realms first if you don't know the realm_id.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}", {
        pathParams: { realm_id: params["realm_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "update_realm",
    {
      description: "Update attributes of a realm. Uses PATCH semantics — omitted fields unchanged, read-only fields ignored. Returns the updated realm object. Returns 400 if unknown fields are present.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "realm": z.object({
    "display_name": z.string().describe("A human-readable name for the realm. This name is used for display purposes.\n").optional(),
    "classification": z.string().describe("Classification of the realm. Can be either SECURE_WORFORCE or SECURE_CUSTOMER").optional(),
  }).describe("A realm is a unique administrative domain within a tenant. Realms may be used to define multiple development environments or for isolated administrative domains.\n"),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "PATCH",
          "/v1/tenants/{tenant_id}/realms/{realm_id}", {
        pathParams: { realm_id: params["realm_id"] as string },
        body: { "realm": params["realm"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "delete_realm",
    {
      description: "Permanently delete a realm. The realm must have NO child resources (identities, groups, roles) or the request fails with 409. Delete all children first. This cannot be undone.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      },
      annotations: { destructiveHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "DELETE",
          "/v1/tenants/{tenant_id}/realms/{realm_id}", {
        pathParams: { realm_id: params["realm_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "list_groups",
    {
      description: "List all groups in a realm. Returns group objects with pagination (page_size max 200, default 20). Supports filter and order_by query parameters. Requires realm_id — use list_realms to discover available realms.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "page_size": z.number().optional().describe("Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed b"),
      "page_token": z.string().optional().describe("Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"),
      "skip": z.number().optional().describe("Number of items to skip. This is the zero-based index of the first result.\n"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/groups", {
        pathParams: { realm_id: params["realm_id"] as string },
        queryParams: { "page_size": params["page_size"] as string | number | boolean | undefined, "page_token": params["page_token"] as string | number | boolean | undefined, "skip": params["skip"] as string | number | boolean | undefined },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "create_group",
    {
      description: "Create a new group in a realm. Requires display_name and description (both required). Returns the new group with an auto-generated id. The group starts with no members — use add_group_members to populate it. Returns 409 if the name already exists.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "group": z.object({
    "display_name": z.string().describe("A human-readable name for the group. This name is used for display purposes.\n").optional(),
    "description": z.string().describe("A free-form text field to describe a group.\n").optional(),
  }).describe("A group is a logical collection of identities. Groups are commonly used as a predicate in a policy rule.\n"),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/groups", {
        pathParams: { realm_id: params["realm_id"] as string },
        body: { "group": params["group"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "get_group",
    {
      description: "Retrieve a specific group by group_id. Returns the group object including id, display_name, description, and timestamps. Use list_groups to discover group_ids.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "group_id": z.string().describe("A unique identifier for a group."),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/groups/{group_id}", {
        pathParams: { realm_id: params["realm_id"] as string, group_id: params["group_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "update_group",
    {
      description: "Update attributes of a group (display_name, description — both are required fields on a group). Uses PATCH semantics — omitted fields unchanged. Returns the updated group object.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "group_id": z.string().describe("A unique identifier for a group."),
      "group": z.object({
    "display_name": z.string().describe("A human-readable name for the group. This name is used for display purposes.\n").optional(),
    "description": z.string().describe("A free-form text field to describe a group.\n").optional(),
  }).describe("A group is a logical collection of identities. Groups are commonly used as a predicate in a policy rule.\n"),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "PATCH",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/groups/{group_id}", {
        pathParams: { realm_id: params["realm_id"] as string, group_id: params["group_id"] as string },
        body: { "group": params["group"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "delete_group",
    {
      description: "Permanently delete a group. The group must have NO members or the request fails with 409. Remove all members with delete_group_members first. This cannot be undone.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "group_id": z.string().describe("A unique identifier for a group."),
      },
      annotations: { destructiveHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "DELETE",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/groups/{group_id}", {
        pathParams: { realm_id: params["realm_id"] as string, group_id: params["group_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "add_group_members",
    {
      description: "Add 1–1000 identities to a group. Provide an array of identity_ids (use list_identities to find them). Requires the group to exist (use list_groups or create_group first). All-or-nothing: if any identity_id is invalid, the entire operation fails. Members inherit any roles assigned to the group.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "group_id": z.string().describe("A unique identifier for a group."),
      "identity_ids": z.array(z.string()).describe("IDs of the identities to be added to the group."),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/groups/{group_id}:addMembers", {
        pathParams: { realm_id: params["realm_id"] as string, group_id: params["group_id"] as string },
        body: { "identity_ids": params["identity_ids"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "delete_group_members",
    {
      description: "Remove 1–1000 identities from a group. Provide an array of identity_ids. All-or-nothing: if any identity_id is invalid, the entire operation fails. Returns the updated group object.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "group_id": z.string().describe("A unique identifier for a group."),
      "identity_ids": z.array(z.string()).describe("IDs of the identities to be removed from the group."),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/groups/{group_id}:deleteMembers", {
        pathParams: { realm_id: params["realm_id"] as string, group_id: params["group_id"] as string },
        body: { "identity_ids": params["identity_ids"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "list_group_members",
    {
      description: "List all identities that are members of a group. Returns full identity objects (not just IDs) with pagination (page_size max 200, default 20). Requires group_id — use list_groups to discover groups.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "group_id": z.string().describe("A unique identifier for a group."),
      "page_size": z.number().optional().describe("Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed b"),
      "page_token": z.string().optional().describe("Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"),
      "skip": z.number().optional().describe("Number of items to skip. This is the zero-based index of the first result.\n"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/groups/{group_id}:listMembers", {
        pathParams: { realm_id: params["realm_id"] as string, group_id: params["group_id"] as string },
        queryParams: { "page_size": params["page_size"] as string | number | boolean | undefined, "page_token": params["page_token"] as string | number | boolean | undefined, "skip": params["skip"] as string | number | boolean | undefined },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "list_group_roles",
    {
      description: "List all roles assigned to a group. Returns role objects with pagination. Optionally filter by resource_server_id. Requires group_id — use list_groups to discover groups.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "group_id": z.string().describe("A unique identifier for a group."),
      "resource_server_id": z.string().optional().describe("The unique identifier of the resource server used to filter roles."),
      "page_size": z.number().optional().describe("Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed b"),
      "page_token": z.string().optional().describe("Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"),
      "skip": z.number().optional().describe("Number of items to skip. This is the zero-based index of the first result.\n"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/groups/{group_id}:listRoles", {
        pathParams: { realm_id: params["realm_id"] as string, group_id: params["group_id"] as string },
        queryParams: { "resource_server_id": params["resource_server_id"] as string | number | boolean | undefined, "page_size": params["page_size"] as string | number | boolean | undefined, "page_token": params["page_token"] as string | number | boolean | undefined, "skip": params["skip"] as string | number | boolean | undefined },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "list_identities",
    {
      description: "List all identities in a realm. Returns identity objects with pagination (page_size max 200, default 20). Supports filtering by username: filter=\"traits.username eq \\\"value\\\"\". The filter is locked to the page_token — changing it between pages returns 400.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "filter": z.string().optional().describe("Filter to constrain the response. The response will only include resources matching this filter. Filters follow the SCIM grammar from [RFC-7644 Section 3.4.2.2](https://datatracker.ietf.org/doc/html/r"),
      "page_size": z.number().optional().describe("Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed b"),
      "page_token": z.string().optional().describe("Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"),
      "skip": z.number().optional().describe("Number of items to skip. This is the zero-based index of the first result.\n"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/identities", {
        pathParams: { realm_id: params["realm_id"] as string },
        queryParams: { "filter": params["filter"] as string | number | boolean | undefined, "page_size": params["page_size"] as string | number | boolean | undefined, "page_token": params["page_token"] as string | number | boolean | undefined, "skip": params["skip"] as string | number | boolean | undefined },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "create_identity",
    {
      description: "Create a new identity (user) in a realm. Requires traits with type, username, and primary_email_address. Both username and email must be unique within the realm (409 if duplicate). The identity starts with status UNENROLLED. Use create_credential_binding_job to provision a passkey.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "identity": z.object({
    "display_name": z.string().describe("A human-readable name for the identity. This name is used for display purposes.\n").optional(),
    "status": z.string().describe("Indicator for the identity's administrative status.  If 'active', the identity is able to generate passkeys and login.  If 'suspended', the identity is unable to generate passkeys or login.\n").optional(),
    "traits": z.object({
    "type": z.string().describe("The type of the traits schema. This value must be provided on all writes.\n"),
    "username": z.string().describe("A required, unique, case-insensitive username for an identity in the realm.").optional(),
    "primary_email_address": z.string().describe("Email address serving as primary contact for identity.").optional(),
    "secondary_email_address": z.string().describe("An additional email address for the user.\n").optional(),
    "external_id": z.string().describe("An ID issued by the provisioning client. It is assumed that the value's uniqueness is controlled by the client setting the value.\n").optional(),
    "family_name": z.string().describe("The family name or last name in most Western languages.\n").optional(),
    "given_name": z.string().describe("The given name or first name in most Western languages.\n").optional(),
    "formatted_name": z.string().describe("The full name, including all middle names, titles, and suffixes as appropriate, formatted for display (e.g. \"Ms. Barbara Jane Jensen, III\").\n").optional(),
    "middle_name": z.string().describe("The middle name of the user, if applicable.\n").optional(),
    "honorific_prefix": z.string().describe("Honorifics like \"Mr.\", \"Mrs.\", \"Dr.\", etc.\n").optional(),
    "honorific_suffix": z.string().describe("Suffixes such as \"Jr.\", \"Sr.\", \"III\", etc.\n").optional(),
    "nick_name": z.string().describe("A nickname the user goes by.\n").optional(),
    "title": z.string().describe("The user's job title.\n").optional(),
    "primary_phone": z.string().describe("The primary contact phone number for the user.\n").optional(),
    "secondary_phone": z.string().describe("An additional phone number for the user.\n").optional(),
    "profile_url": z.string().describe("A URL to the user's profile.\n").optional(),
    "photo": z.string().describe("A URL to the user's photo.\n").optional(),
    "preferred_language": z.string().describe("The user's preferred language.\n").optional(),
    "locale": z.string().describe("The locale of the user, typically in the format of language-region.\n").optional(),
    "timezone": z.string().describe("The timezone of the user.\n").optional(),
    "formatted_address": z.string().describe("The full mailing address, formatted for display or use with a mailing label. This attribute MAY contain newlines.\n").optional(),
    "street_address": z.string().describe("The full street address component, which may include house number, street name, P.O. box, and multi-line extended street address information. This attribute MAY contain newlines.\n").optional(),
    "locality": z.string().describe("The locality or city of the user.\n").optional(),
    "region": z.string().describe("The region or state of the user.\n").optional(),
    "postal_code": z.string().describe("The zip code or postal code of the user.\n").optional(),
    "country": z.string().describe("The country of the user.\n").optional(),
    "user_type": z.string().describe("Used to identify the relationship between the organization and the user. Typical values used might be 'Contractor', 'Employee', 'Intern', 'Temp', 'External', and 'Unknown', but any value may be used.\n").optional(),
    "employee_number": z.string().describe("The employee number assigned to the user, typically based on order of hire or association with an organization.\n").optional(),
    "cost_center": z.string().describe("The cost center associated with the user.\n").optional(),
    "organization": z.string().describe("The organization the user belongs to.\n").optional(),
    "division": z.string().describe("The division of the organization the user belongs to.\n").optional(),
    "department": z.string().describe("The department of the organization the user belongs to.\n").optional(),
    "manager_id": z.string().describe("The unique identifier for the user's manager.\n").optional(),
    "manager_name": z.string().describe("The name of the user's manager.\n").optional(),
  }).describe("Set of traits associated with an identity.").optional(),
  }).describe("An identity is a unique identifier that may be used by an end-user to gain access governed by Beyond Identity.\n"),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/identities", {
        pathParams: { realm_id: params["realm_id"] as string },
        body: { "identity": params["identity"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "batch_delete_identities",
    {
      description: "Delete 1–1000 identities in a single atomic operation. Provide an array of identity_ids. No duplicates allowed. All-or-nothing: if any ID is invalid, none are deleted. Each deleted identity is removed from groups and has roles revoked.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "ids": z.array(z.string()).describe("IDs of the identities to be deleted."),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/identities:batchDelete", {
        pathParams: { realm_id: params["realm_id"] as string },
        body: { "ids": params["ids"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "get_identity",
    {
      description: "Retrieve a specific identity by identity_id. Returns the full identity object including display_name, traits (username, email), status, and timestamps. Use list_identities to discover identity_ids.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "identity_id": z.string().describe("A unique identifier for an identity."),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/identities/{identity_id}", {
        pathParams: { realm_id: params["realm_id"] as string, identity_id: params["identity_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "update_identity",
    {
      description: "Update attributes of an identity (display_name, traits). Uses PATCH semantics — omitted fields unchanged. Returns 409 if updated username or email conflicts with an existing identity.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "identity_id": z.string().describe("A unique identifier for an identity."),
      "identity": z.object({
    "display_name": z.string().describe("A human-readable name for the identity. This name is used for display purposes.\n").optional(),
    "status": z.string().describe("Indicator for the identity's administrative status.  If 'active', the identity is able to generate passkeys and login.  If 'suspended', the identity is unable to generate passkeys or login.\n").optional(),
    "traits": z.object({
    "type": z.string().describe("The type of the traits schema. This value must be provided on all writes.\n"),
    "username": z.string().describe("A required, unique, case-insensitive username for an identity in the realm.").optional(),
    "primary_email_address": z.string().describe("Email address serving as primary contact for identity.").optional(),
    "secondary_email_address": z.string().describe("An additional email address for the user.\n").optional(),
    "external_id": z.string().describe("An ID issued by the provisioning client. It is assumed that the value's uniqueness is controlled by the client setting the value.\n").optional(),
    "family_name": z.string().describe("The family name or last name in most Western languages.\n").optional(),
    "given_name": z.string().describe("The given name or first name in most Western languages.\n").optional(),
    "formatted_name": z.string().describe("The full name, including all middle names, titles, and suffixes as appropriate, formatted for display (e.g. \"Ms. Barbara Jane Jensen, III\").\n").optional(),
    "middle_name": z.string().describe("The middle name of the user, if applicable.\n").optional(),
    "honorific_prefix": z.string().describe("Honorifics like \"Mr.\", \"Mrs.\", \"Dr.\", etc.\n").optional(),
    "honorific_suffix": z.string().describe("Suffixes such as \"Jr.\", \"Sr.\", \"III\", etc.\n").optional(),
    "nick_name": z.string().describe("A nickname the user goes by.\n").optional(),
    "title": z.string().describe("The user's job title.\n").optional(),
    "primary_phone": z.string().describe("The primary contact phone number for the user.\n").optional(),
    "secondary_phone": z.string().describe("An additional phone number for the user.\n").optional(),
    "profile_url": z.string().describe("A URL to the user's profile.\n").optional(),
    "photo": z.string().describe("A URL to the user's photo.\n").optional(),
    "preferred_language": z.string().describe("The user's preferred language.\n").optional(),
    "locale": z.string().describe("The locale of the user, typically in the format of language-region.\n").optional(),
    "timezone": z.string().describe("The timezone of the user.\n").optional(),
    "formatted_address": z.string().describe("The full mailing address, formatted for display or use with a mailing label. This attribute MAY contain newlines.\n").optional(),
    "street_address": z.string().describe("The full street address component, which may include house number, street name, P.O. box, and multi-line extended street address information. This attribute MAY contain newlines.\n").optional(),
    "locality": z.string().describe("The locality or city of the user.\n").optional(),
    "region": z.string().describe("The region or state of the user.\n").optional(),
    "postal_code": z.string().describe("The zip code or postal code of the user.\n").optional(),
    "country": z.string().describe("The country of the user.\n").optional(),
    "user_type": z.string().describe("Used to identify the relationship between the organization and the user. Typical values used might be 'Contractor', 'Employee', 'Intern', 'Temp', 'External', and 'Unknown', but any value may be used.\n").optional(),
    "employee_number": z.string().describe("The employee number assigned to the user, typically based on order of hire or association with an organization.\n").optional(),
    "cost_center": z.string().describe("The cost center associated with the user.\n").optional(),
    "organization": z.string().describe("The organization the user belongs to.\n").optional(),
    "division": z.string().describe("The division of the organization the user belongs to.\n").optional(),
    "department": z.string().describe("The department of the organization the user belongs to.\n").optional(),
    "manager_id": z.string().describe("The unique identifier for the user's manager.\n").optional(),
    "manager_name": z.string().describe("The name of the user's manager.\n").optional(),
  }).describe("Set of traits associated with an identity.").optional(),
  }).describe("An identity is a unique identifier that may be used by an end-user to gain access governed by Beyond Identity.\n"),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "PATCH",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/identities/{identity_id}", {
        pathParams: { realm_id: params["realm_id"] as string, identity_id: params["identity_id"] as string },
        body: { "identity": params["identity"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "delete_identity",
    {
      description: "Permanently delete an identity. Automatically removes the identity from all groups and revokes all role assignments. This cannot be undone.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "identity_id": z.string().describe("A unique identifier for an identity."),
      },
      annotations: { destructiveHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "DELETE",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/identities/{identity_id}", {
        pathParams: { realm_id: params["realm_id"] as string, identity_id: params["identity_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "list_identity_groups",
    {
      description: "List all groups an identity belongs to. Returns full group objects (not just IDs) with pagination (page_size max 200). Requires identity_id — use list_identities to find identities.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "identity_id": z.string().describe("A unique identifier for an identity."),
      "page_size": z.number().optional().describe("Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed b"),
      "page_token": z.string().optional().describe("Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"),
      "skip": z.number().optional().describe("Number of items to skip. This is the zero-based index of the first result.\n"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/identities/{identity_id}:listGroups", {
        pathParams: { realm_id: params["realm_id"] as string, identity_id: params["identity_id"] as string },
        queryParams: { "page_size": params["page_size"] as string | number | boolean | undefined, "page_token": params["page_token"] as string | number | boolean | undefined, "skip": params["skip"] as string | number | boolean | undefined },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "list_identity_roles",
    {
      description: "List all roles directly assigned to an identity. Returns role objects with pagination. Optionally filter by resource_server_id. Requires identity_id — use list_identities to find identities.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "identity_id": z.string().describe("A unique identifier for an identity."),
      "resource_server_id": z.string().optional().describe("The unique identifier of the resource server used to filter roles."),
      "page_size": z.number().optional().describe("Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed b"),
      "page_token": z.string().optional().describe("Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"),
      "skip": z.number().optional().describe("Number of items to skip. This is the zero-based index of the first result.\n"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/identities/{identity_id}:listRoles", {
        pathParams: { realm_id: params["realm_id"] as string, identity_id: params["identity_id"] as string },
        queryParams: { "resource_server_id": params["resource_server_id"] as string | number | boolean | undefined, "page_size": params["page_size"] as string | number | boolean | undefined, "page_token": params["page_token"] as string | number | boolean | undefined, "skip": params["skip"] as string | number | boolean | undefined },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "list_roles",
    {
      description: "List all roles for a resource server. Returns role objects with pagination (page_size max 200, default 20). Requires resource_server_id — use list_resource_servers to discover them. Role display_name and description cannot contain special characters.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "resource_server_id": z.string().describe("A unique identifier for a resource server."),
      "page_size": z.number().optional().describe("Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed b"),
      "page_token": z.string().optional().describe("Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"),
      "skip": z.number().optional().describe("Number of items to skip. This is the zero-based index of the first result.\n"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers/{resource_server_id}/roles", {
        pathParams: { realm_id: params["realm_id"] as string, resource_server_id: params["resource_server_id"] as string },
        queryParams: { "page_size": params["page_size"] as string | number | boolean | undefined, "page_token": params["page_token"] as string | number | boolean | undefined, "skip": params["skip"] as string | number | boolean | undefined },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "create_role",
    {
      description: "Create a new role within a resource server. Requires display_name (1–64 chars) and optional description (max 300 chars). No special characters allowed. The role starts empty — use add_role_members and add_role_scopes to populate it. Requires resource_server_id.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "resource_server_id": z.string().describe("A unique identifier for a resource server."),
      "group": z.object({
    "display_name": z.string().describe("A human-readable name for the role. This name is used for display purposes.\n").optional(),
    "description": z.string().describe("A free-form text field to describe a role.\n").optional(),
  }).describe("A role is a logical collection of scopes. Roles are commonly used to limit\naccess control.\n\nThe scopes belonging to a role are limited to its associated resource server.\nHowever, note that the resourc").optional(),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers/{resource_server_id}/roles", {
        pathParams: { realm_id: params["realm_id"] as string, resource_server_id: params["resource_server_id"] as string },
        body: { "group": params["group"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "get_role",
    {
      description: "Retrieve a specific role by role_id. Returns the role object but does NOT include scopes or members — use list_role_scopes and list_role_members for those.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "resource_server_id": z.string().describe("A unique identifier for a resource server."),
      "role_id": z.string().describe("A unique identifier for a role."),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers/{resource_server_id}/roles/{role_id}", {
        pathParams: { realm_id: params["realm_id"] as string, resource_server_id: params["resource_server_id"] as string, role_id: params["role_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "update_role",
    {
      description: "Update a role's display_name or description. Uses PATCH semantics. Cannot change resource_server_id or realm_id. Does not affect existing scopes or members.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "resource_server_id": z.string().describe("A unique identifier for a resource server."),
      "role_id": z.string().describe("A unique identifier for a role."),
      "role": z.object({
    "display_name": z.string().describe("A human-readable name for the role. This name is used for display purposes.\n").optional(),
    "description": z.string().describe("A free-form text field to describe a role.\n").optional(),
  }).describe("A role is a logical collection of scopes. Roles are commonly used to limit\naccess control.\n\nThe scopes belonging to a role are limited to its associated resource server.\nHowever, note that the resourc"),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "PATCH",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers/{resource_server_id}/roles/{role_id}", {
        pathParams: { realm_id: params["realm_id"] as string, resource_server_id: params["resource_server_id"] as string, role_id: params["role_id"] as string },
        body: { "role": params["role"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "delete_role",
    {
      description: "Permanently delete a role. The role must have NO scopes AND no members, or the request fails with 409. Remove all scopes with delete_role_scopes and all members with delete_role_members first.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "resource_server_id": z.string().describe("A unique identifier for a resource server."),
      "role_id": z.string().describe("A unique identifier for a role."),
      },
      annotations: { destructiveHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "DELETE",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers/{resource_server_id}/roles/{role_id}", {
        pathParams: { realm_id: params["realm_id"] as string, resource_server_id: params["resource_server_id"] as string, role_id: params["role_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "add_role_members",
    {
      description: "Assign identities and/or groups to a role. Provide group_ids and/or identity_ids (1–1000 total). All referenced identities and groups must exist. Additive — does not replace existing members.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "resource_server_id": z.string().describe("A unique identifier for a resource server."),
      "role_id": z.string().describe("A unique identifier for a role."),
      "group_ids": z.array(z.string()).describe("IDs of the groups to be assigned to the role.").optional(),
      "identity_ids": z.array(z.string()).describe("IDs of the identities to be assigned to the role.").optional(),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers/{resource_server_id}/roles/{role_id}:addMembers", {
        pathParams: { realm_id: params["realm_id"] as string, resource_server_id: params["resource_server_id"] as string, role_id: params["role_id"] as string },
        body: { "group_ids": params["group_ids"], "identity_ids": params["identity_ids"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "delete_role_members",
    {
      description: "Unassign identities and/or groups from a role. Provide group_ids and/or identity_ids (1–1000 total). Idempotent — removing non-existent members does not error.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "resource_server_id": z.string().describe("A unique identifier for a resource server."),
      "role_id": z.string().describe("A unique identifier for a role."),
      "group_ids": z.array(z.string()).describe("IDs of the groups to be unassigned from the role.").optional(),
      "identity_ids": z.array(z.string()).describe("IDs of the identities to be unassigned from the role.").optional(),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers/{resource_server_id}/roles/{role_id}:deleteMembers", {
        pathParams: { realm_id: params["realm_id"] as string, resource_server_id: params["resource_server_id"] as string, role_id: params["role_id"] as string },
        body: { "group_ids": params["group_ids"], "identity_ids": params["identity_ids"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "list_role_members",
    {
      description: "List all identities and groups assigned to a role. Returns groups and identities separately with separate pagination (groups_page_size, identities_page_size, groups_skip, identities_skip).",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "resource_server_id": z.string().describe("A unique identifier for a resource server."),
      "role_id": z.string().describe("A unique identifier for a role."),
      "groups_page_size": z.number().optional().describe("Number of groups returned per page for ListRoleMembers. The response will include at most this many groups but may include fewer. If this value is omitted, the response will return the default number "),
      "groups_skip": z.number().optional().describe("Number of groups to skip for ListRoleMembers. This is the zero-based index of the first group result.\n"),
      "identities_page_size": z.number().optional().describe("Number of identities returned per page for ListRoleMembers. The response will include at most this many identities but may include fewer. If this value is omitted, the response will return the default"),
      "identities_skip": z.number().optional().describe("Number of identities to skip for ListRoleMembers. This is the zero-based index of the first identity result.\n"),
      "page_token": z.string().optional().describe("Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers/{resource_server_id}/roles/{role_id}:listMembers", {
        pathParams: { realm_id: params["realm_id"] as string, resource_server_id: params["resource_server_id"] as string, role_id: params["role_id"] as string },
        queryParams: { "groups_page_size": params["groups_page_size"] as string | number | boolean | undefined, "groups_skip": params["groups_skip"] as string | number | boolean | undefined, "identities_page_size": params["identities_page_size"] as string | number | boolean | undefined, "identities_skip": params["identities_skip"] as string | number | boolean | undefined, "page_token": params["page_token"] as string | number | boolean | undefined },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "add_role_scopes",
    {
      description: "Assign scopes from the role's resource server to a role. Provide 1–1000 scope strings. All scopes must be defined in the resource server. Additive — does not replace existing scopes. Duplicate scopes are ignored.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "resource_server_id": z.string().describe("A unique identifier for a resource server."),
      "role_id": z.string().describe("A unique identifier for a role."),
      "scopes": z.array(z.string()).describe("Scopes to be assigned to the role."),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers/{resource_server_id}/roles/{role_id}:addScopes", {
        pathParams: { realm_id: params["realm_id"] as string, resource_server_id: params["resource_server_id"] as string, role_id: params["role_id"] as string },
        body: { "scopes": params["scopes"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "delete_role_scopes",
    {
      description: "Remove scopes from a role. Provide 1–1000 scope strings. Idempotent — removing non-existent scopes does not error. A role must have no scopes before it can be deleted.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "resource_server_id": z.string().describe("A unique identifier for a resource server."),
      "role_id": z.string().describe("A unique identifier for a role."),
      "scopes": z.array(z.string()).describe("Scopes to be removed from the role."),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers/{resource_server_id}/roles/{role_id}:deleteScopes", {
        pathParams: { realm_id: params["realm_id"] as string, resource_server_id: params["resource_server_id"] as string, role_id: params["role_id"] as string },
        body: { "scopes": params["scopes"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "list_role_scopes",
    {
      description: "List all scopes assigned to a role. Returns an array of scope strings with pagination (page_size max 200, default 20).",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "resource_server_id": z.string().describe("A unique identifier for a resource server."),
      "role_id": z.string().describe("A unique identifier for a role."),
      "page_size": z.number().optional().describe("Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed b"),
      "page_token": z.string().optional().describe("Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"),
      "skip": z.number().optional().describe("Number of items to skip. This is the zero-based index of the first result.\n"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers/{resource_server_id}/roles/{role_id}:listScopes", {
        pathParams: { realm_id: params["realm_id"] as string, resource_server_id: params["resource_server_id"] as string, role_id: params["role_id"] as string },
        queryParams: { "page_size": params["page_size"] as string | number | boolean | undefined, "page_token": params["page_token"] as string | number | boolean | undefined, "skip": params["skip"] as string | number | boolean | undefined },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "list_credentials",
    {
      description: "List credentials (passkeys) for an identity. Use identity_id=\"-\" as a wildcard to list all credentials across all identities in the realm. Returns credential objects with state (ACTIVE/REVOKED), type, and key info. Requires identity_id — use list_identities to find them.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "identity_id": z.string().describe("A unique identifier for an identity."),
      "page_size": z.number().optional().describe("Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed b"),
      "page_token": z.string().optional().describe("Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"),
      "skip": z.number().optional().describe("Number of items to skip. This is the zero-based index of the first result.\n"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/identities/{identity_id}/credentials", {
        pathParams: { realm_id: params["realm_id"] as string, identity_id: params["identity_id"] as string },
        queryParams: { "page_size": params["page_size"] as string | number | boolean | undefined, "page_token": params["page_token"] as string | number | boolean | undefined, "skip": params["skip"] as string | number | boolean | undefined },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "get_credential",
    {
      description: "Retrieve a specific credential by credential_id. Returns the full credential object including state, csr_type (JWT/WEBAUTHN/FIDO2), jwk_json, and jwk_thumbprint. Requires both identity_id and credential_id.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "identity_id": z.string().describe("A unique identifier for an identity."),
      "credential_id": z.string().describe("A unique identifier for a credential."),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/identities/{identity_id}/credentials/{credential_id}", {
        pathParams: { realm_id: params["realm_id"] as string, identity_id: params["identity_id"] as string, credential_id: params["credential_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "revoke_credential",
    {
      description: "Permanently revoke a credential, preventing it from being used for authentication. The credential must be in ACTIVE state. Revocation is irreversible — the credential record remains but its state changes to REVOKED.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "identity_id": z.string().describe("A unique identifier for an identity."),
      "credential_id": z.string().describe("A unique identifier for a credential."),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/identities/{identity_id}/credentials/{credential_id}:revoke", {
        pathParams: { realm_id: params["realm_id"] as string, identity_id: params["identity_id"] as string, credential_id: params["credential_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "list_credential_binding_jobs",
    {
      description: "List credential binding jobs for an identity. Use identity_id=\"-\" as a wildcard to list all jobs in the realm. Jobs track the passkey provisioning lifecycle with states: LINK_SENT, LINK_OPENED, REQUEST_DELIVERED, COMPLETE, EXPIRED, FAILED_TO_SEND, REVOKED.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "identity_id": z.string().describe("A unique identifier for an identity."),
      "page_size": z.number().optional().describe("Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed b"),
      "page_token": z.string().optional().describe("Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"),
      "skip": z.number().optional().describe("Number of items to skip. This is the zero-based index of the first result.\n"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/identities/{identity_id}/credential-binding-jobs", {
        pathParams: { realm_id: params["realm_id"] as string, identity_id: params["identity_id"] as string },
        queryParams: { "page_size": params["page_size"] as string | number | boolean | undefined, "page_token": params["page_token"] as string | number | boolean | undefined, "skip": params["skip"] as string | number | boolean | undefined },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "create_credential_binding_job",
    {
      description: "Create a job to provision a new passkey for an identity. Requires authenticator_config_id (use list_authenticator_configs) and delivery_method (RETURN or EMAIL). RETURN gives you the binding link directly; EMAIL sends it to the identity's email. Returns 422 if EMAIL delivery is used but the identity has no email address.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "identity_id": z.string().describe("A unique identifier for an identity."),
      "job": z.object({
    "credential_id": z.string().describe("A unique identifier for the credential that was bound via the credential binding job. This field will only be populated if the credential binding job has successfully been used to bind a credential to").optional(),
    "delivery_method": z.enum(["RETURN", "EMAIL"]).describe("The method by which a credential binding link is delivered to the target\nauthenticator or identity.\n\nThe value `RETURN` indicates that a credential binding link will be\nreturned to the caller upon cre").optional(),
    "post_binding_redirect_uri": z.string().describe("The URI to which the caller will be redirected after successfully binding a credential to an identity. This field is optional. If not specified, the authenticator will not attempt to redirect to a new").optional(),
    "authenticator_config": z.object({
    "config": z.union([z.object({
    "invocation_type": z.enum(["automatic", "manual"]).describe("The method used to invoke the `invoke_url` in the embedded authenticator\nconfig type. The two methods available are:\n\nThe value `automatic` indicates that this invocation type automatically\nredirects ").optional(),
    "invoke_url": z.string().describe("URL to invoke during the authentication flow."),
    "trusted_origins": z.array(z.string()).describe("Trusted origins are URLs that will be allowed to make requests from a browser to the Beyond Identity API. This is used with Cross-Origin Resource Sharing (CORS). These may be in the form of `<scheme> "),
    "type": z.enum(["embedded"]),
    "authentication_methods": z.array(z.object({
    "type": z.any(),
  })).optional(),
  }).describe("Configuration options for the embedded SDK authenticator."), z.object({
    "type": z.enum(["console"]),
    "onboarding_configuration": z.object({
    "verification_method": z.union([z.any(), z.any()]),
  }).describe("Configuration options for the console onboarding experience."),
  }).describe("Configuration options for credential enrollment, enabling an identity to access the Beyond Identity Console. These options support both IDP-authorized flows and non-verified enrollment pathways.\n")]).optional(),
  }).describe("Representation of an authenticator configuration. This prescribes how an identity may authenticate themselves with Beyond Identity.\n").optional(),
    "authenticator_config_id": z.string().describe("The ID of the authenticator configuration to be used to build the credential binding job. This field is immutable.\n").optional(),
  }).describe("A credential binding job defines the state of binding a new credential to an identity. The state includes creation of the credential binding job to delivery of the credential binding method to complet"),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/identities/{identity_id}/credential-binding-jobs", {
        pathParams: { realm_id: params["realm_id"] as string, identity_id: params["identity_id"] as string },
        body: { "job": params["job"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "get_credential_binding_job",
    {
      description: "Retrieve a specific credential binding job. The credential_id field is only populated when the job state is COMPLETE. Use this to check if a binding job has finished.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "identity_id": z.string().describe("A unique identifier for an identity."),
      "credential_binding_job_id": z.string().describe("A unique identifier for a credential binding job."),
      "filter": z.string().optional().describe("Filter to constrain the response. The response will only include resources matching this filter. Filters follow the SCIM grammar from [RFC-7644 Section 3.4.2.2](https://datatracker.ietf.org/doc/html/r"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/identities/{identity_id}/credential-binding-jobs/{credential_binding_job_id}", {
        pathParams: { realm_id: params["realm_id"] as string, identity_id: params["identity_id"] as string, credential_binding_job_id: params["credential_binding_job_id"] as string },
        queryParams: { "filter": params["filter"] as string | number | boolean | undefined },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "set_credential_binding_job_revoked",
    {
      description: "Revoke an active credential binding job, invalidating its binding link. The job must be in an active state — cannot revoke jobs that are already COMPLETE, EXPIRED, or REVOKED.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "identity_id": z.string().describe("A unique identifier for an identity."),
      "credential_binding_job_id": z.string().describe("A unique identifier for a credential binding job."),
      body: z.record(z.any()).describe("Request for `SetCredentialBindingJobRevoked`. This request body is empty.\n"),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/identities/{identity_id}/credential-binding-jobs/{credential_binding_job_id}:revoke", {
        pathParams: { realm_id: params["realm_id"] as string, identity_id: params["identity_id"] as string, credential_binding_job_id: params["credential_binding_job_id"] as string },
        body: params.body,
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "create_batch_credential_binding_job",
    {
      description: "Create binding jobs for up to 1000 identities at once. Each realm is limited to 1000 jobs in the queue — exceeding this returns 429. Individual jobs are created asynchronously. Use list_batch_credential_binding_job_results to check progress.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "batch_credential_binding_job": z.object({
    "identity_ids": z.array(z.string()).describe("The list of identities associated with the batch credential binding job.\n"),
    "job_template": z.object({
    "post_binding_redirect_uri": z.string().describe("The URI to which the caller will be redirected after successfully binding a credential to an identity. This field is optional. If not specified, the authenticator will not attempt to redirect to a new").optional(),
    "authenticator_config": z.object({
    "config": z.union([z.object({
    "invocation_type": z.enum(["automatic", "manual"]).describe("The method used to invoke the `invoke_url` in the embedded authenticator\nconfig type. The two methods available are:\n\nThe value `automatic` indicates that this invocation type automatically\nredirects ").optional(),
    "invoke_url": z.string().describe("URL to invoke during the authentication flow."),
    "trusted_origins": z.array(z.any()).describe("Trusted origins are URLs that will be allowed to make requests from a browser to the Beyond Identity API. This is used with Cross-Origin Resource Sharing (CORS). These may be in the form of `<scheme> "),
    "type": z.enum(["embedded"]),
    "authentication_methods": z.array(z.any()).optional(),
  }).describe("Configuration options for the embedded SDK authenticator."), z.object({
    "type": z.enum(["console"]),
    "onboarding_configuration": z.object({
    "verification_method": z.any(),
  }).describe("Configuration options for the console onboarding experience."),
  }).describe("Configuration options for credential enrollment, enabling an identity to access the Beyond Identity Console. These options support both IDP-authorized flows and non-verified enrollment pathways.\n")]).optional(),
  }).describe("Representation of an authenticator configuration. This prescribes how an identity may authenticate themselves with Beyond Identity.\n").optional(),
    "authenticator_config_id": z.string().describe("The ID of the authenticator configuration to be used to build the credential binding job. This field is immutable.\n").optional(),
  }).describe("A batch credential binding job template provides a template for the credential binding jobs created via a batch.\n"),
  }).describe("A batch credential binding job manages the binding of credentials for multiple identities in a batch operation.\n"),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/batch-credential-binding-jobs", {
        pathParams: { realm_id: params["realm_id"] as string },
        body: { "batch_credential_binding_job": params["batch_credential_binding_job"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "get_batch_credential_binding_job",
    {
      description: "Retrieve details of a batch credential binding job including the list of identity_ids and job template configuration.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "batch_credential_binding_job_id": z.string().describe("A unique identifier for a batch credential binding job."),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/batch-credential-binding-jobs/{batch_credential_binding_job_id}", {
        pathParams: { realm_id: params["realm_id"] as string, batch_credential_binding_job_id: params["batch_credential_binding_job_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "list_batch_credential_binding_job_results",
    {
      description: "List per-identity results of a batch binding job. Each result includes the identity_id, credential_id (if successful), state, and error information (if failed).",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "batch_credential_binding_job_id": z.string().describe("A unique identifier for a batch credential binding job."),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/batch-credential-binding-jobs/{batch_credential_binding_job_id}:listResults", {
        pathParams: { realm_id: params["realm_id"] as string, batch_credential_binding_job_id: params["batch_credential_binding_job_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "create_theme",
    {
      description: "Create a branding theme for a realm. Each realm supports only one theme — returns 409 if a theme already exists. The theme is not automatically activated after creation. Use update_theme to modify it.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "theme": z.object({
    "email_realm_name": z.string().describe("Realm name that is used in email templates.").optional(),
    "logo_url_light": z.string().describe("URL for resolving the logo image for light mode.").optional(),
    "logo_url_dark": z.string().describe("URL for resolving the logo image for dark mode.").optional(),
    "support_url": z.string().describe("URL for the customer support portal.").optional(),
    "button_color": z.string().describe("Hexadecimal color code to use for buttons.").optional(),
    "button_text_color": z.string().describe("Hexadecimal color code to use for button text.").optional(),
  }).describe("A theme is a collection of configurable assets that unifies the end user login experience with your brand and products. It is primarily used to change the styling of the credential binding email.\n").optional(),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/themes", {
        pathParams: { realm_id: params["realm_id"] as string },
        body: { "theme": params["theme"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "get_active_theme",
    {
      description: "Get the currently active theme for a realm. Returns a default system theme if no custom theme has been set. Does not indicate whether the returned theme is the default or a custom one.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/themes/active", {
        pathParams: { realm_id: params["realm_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "get_theme",
    {
      description: "Retrieve a specific theme by theme_id. Returns the full theme object with all branding configuration properties.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "theme_id": z.string().describe("A unique identifier for a theme."),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/themes/{theme_id}", {
        pathParams: { realm_id: params["realm_id"] as string, theme_id: params["theme_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "update_theme",
    {
      description: "Update attributes of a theme. Uses PATCH semantics — omitted fields unchanged. Changes take effect immediately if the theme is active. The theme_id, tenant_id, and realm_id from the URL override any values in the request body.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "theme_id": z.string().describe("A unique identifier for a theme."),
      "theme": z.object({
    "email_realm_name": z.string().describe("Realm name that is used in email templates.").optional(),
    "logo_url_light": z.string().describe("URL for resolving the logo image for light mode.").optional(),
    "logo_url_dark": z.string().describe("URL for resolving the logo image for dark mode.").optional(),
    "support_url": z.string().describe("URL for the customer support portal.").optional(),
    "button_color": z.string().describe("Hexadecimal color code to use for buttons.").optional(),
    "button_text_color": z.string().describe("Hexadecimal color code to use for button text.").optional(),
  }).describe("A theme is a collection of configurable assets that unifies the end user login experience with your brand and products. It is primarily used to change the styling of the credential binding email.\n").optional(),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "PATCH",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/themes/{theme_id}", {
        pathParams: { realm_id: params["realm_id"] as string, theme_id: params["theme_id"] as string },
        body: { "theme": params["theme"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "list_applications",
    {
      description: "List all applications in a realm. Returns application objects including protocol_config (OIDC/OAuth2/SAML), resource_server_id, and authenticator_config_id. Pagination: page_size max 100, default 100. Includes both user-created and system-managed applications.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "page_size": z.number().optional().describe("Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed b"),
      "page_token": z.string().optional().describe("Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/applications", {
        pathParams: { realm_id: params["realm_id"] as string },
        queryParams: { "page_size": params["page_size"] as string | number | boolean | undefined, "page_token": params["page_token"] as string | number | boolean | undefined },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "create_application",
    {
      description: "Create a new application (OIDC, OAuth2, or SAML). Requires display_name and protocol_config with type-specific fields. Optionally link to a resource_server_id (for API scopes) and authenticator_config_id (for authentication method). The app starts with no SSO config — use create_sso_config to set one up.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "application": z.object({
    "resource_server_id": z.string().describe("A unique identifier for the application's resource server. At present, the only available resource server is for the Beyond Identity Management API. Referencing this resource server from an applicatio").optional(),
    "authenticator_config_id": z.string().describe("A unique identifier for the application's authenticator configuration. This field is unused for `oidc` and `oauth2` applications when `grant_type=client_credentials`.\n").optional(),
    "display_name": z.string().describe("A human-readable name for the application. This name is used for display purposes.\n").optional(),
    "protocol_config": z.union([z.object({
    "type": z.enum(["oauth2"]),
    "allowed_scopes": z.array(z.string()).describe("Scopes to which this application can grant access. If this application references a resource server, this set of scopes must be a subset of the resource server's available scopes. If this application ").optional(),
    "confidentiality": z.enum(["confidential", "public"]).describe("The confidentiality of the client, as prescribed by OAuth 2.0 and\nOIDC. Confidentiality is based on a client's ability to authenticate\nsecurely with the authorization server (i.e., ability to\nmaintain").optional(),
    "token_endpoint_auth_method": z.enum(["client_secret_basic", "client_secret_post", "none"]).describe("Indicator of the requested authentication method for the token endpoint.\nAllowable values are: - `client_secret_post`: The client uses the HTTP POST\nparameters\n   as defined in OAuth 2.0, Section 2.3.").optional(),
    "grant_type": z.array(z.enum(["authorization_code", "client_credentials"])).describe("Grant types supported by this application's `token` endpoint. Allowable values\nare:\n- `authorization_code`: The authorization code grant type defined\n  in OAuth 2.0, Section 4.1. Namely, the client ma").optional(),
    "redirect_uris": z.array(z.string()).describe("A list of valid URIs to redirect the resource owner's user-agent to after completing its interaction with the authorization server. See https://datatracker.ietf.org/doc/html/rfc6749#section-3.1.2 for ").optional(),
    "token_configuration": z.object({
    "expires_after": z.number().describe("Time after minting, in seconds, for which the token will be considered valid.\n"),
    "token_signing_algorithm": z.enum(["RS256"]).describe("Signing algorithm to use for an application token. The only allowable value at present is `RS256`.\n").optional(),
    "subject_field": z.enum(["id", "email", "username"]).describe("Property of a principal which is used to fill the subject of a token issued for this application.\n").optional(),
  }).describe("Properties of a token issued for an application.").optional(),
    "pkce": z.enum(["disabled", "plain", "s256"]).describe("PKCE code challenge methods supported for applications, as defined by\n[RFC-7636](https://datatracker.ietf.org/doc/html/rfc7636). Allowable values are:\n  - `disabled` : PKCE is disabled for this applic").optional(),
    "token_format": z.enum(["self_contained", "referential"]).describe("Allowed access token formats for this application.\ntoken type. Allowable values are:\n- `self_contained`: token in JWT format.\n- `referential`: Encoded token which requires /introspect\n   call in order").optional(),
  }).describe("OAuth2 protocol configuration."), z.object({
    "type": z.enum(["oidc"]),
    "allowed_scopes": z.array(z.string()).describe("Scopes to which this application can grant access. If this application references a resource server, this set of scopes must be a subset of the resource server's available scopes. If this application ").optional(),
    "confidentiality": z.enum(["confidential", "public"]).describe("The confidentiality of the client, as prescribed by OAuth 2.0 and\nOIDC. Confidentiality is based on a client's ability to authenticate\nsecurely with the authorization server (i.e., ability to\nmaintain").optional(),
    "token_endpoint_auth_method": z.enum(["client_secret_basic", "client_secret_post", "none"]).describe("Indicator of the requested authentication method for the token endpoint.\nAllowable values are: - `client_secret_post`: The client uses the HTTP POST\nparameters\n   as defined in OAuth 2.0, Section 2.3.").optional(),
    "grant_type": z.array(z.enum(["authorization_code", "client_credentials"])).describe("Grant types supported by this application's `token` endpoint. Allowable values\nare:\n- `authorization_code`: The authorization code grant type defined\n  in OAuth 2.0, Section 4.1. Namely, the client ma").optional(),
    "redirect_uris": z.array(z.string()).describe("A list of valid URIs to redirect the resource owner's user-agent to after completing its interaction with the authorization server. See https://datatracker.ietf.org/doc/html/rfc6749#section-3.1.2 for ").optional(),
    "token_configuration": z.object({
    "expires_after": z.number().describe("Time after minting, in seconds, for which the token will be considered valid.\n"),
    "token_signing_algorithm": z.enum(["RS256"]).describe("Signing algorithm to use for an application token. The only allowable value at present is `RS256`.\n").optional(),
    "subject_field": z.enum(["id", "email", "username"]).describe("Property of a principal which is used to fill the subject of a token issued for this application.\n").optional(),
  }).describe("Properties of a token issued for an application.").optional(),
    "pkce": z.enum(["disabled", "plain", "s256"]).describe("PKCE code challenge methods supported for applications, as defined by\n[RFC-7636](https://datatracker.ietf.org/doc/html/rfc7636). Allowable values are:\n  - `disabled` : PKCE is disabled for this applic").optional(),
    "token_format": z.enum(["self_contained", "referential"]).describe("Allowed access token formats for this application.\ntoken type. Allowable values are:\n- `self_contained`: token in JWT format.\n- `referential`: Encoded token which requires /introspect\n   call in order").optional(),
  }).describe("OIDC protocol configuration."), z.object({
    "type": z.enum(["saml"]),
    "acs_url": z.string().describe("Location where the SAML Response is sent via HTTP-POST. Often referred to as the SAML Assertion Consumer Service (ACS) URL.\n"),
    "override_recipient_and_destination": z.boolean().describe("When this is true, the `recipient_url` and the `destination_url` are used for SAML Response.\nWhen this is false, both the `recipient_url` and the `destination_url` are omitted and the `acs_url` is use"),
    "recipient_url": z.string().describe("If `override_recipient_and_destination` is set to `true`, this field is utilized for the SAML Response. If it is `false`, this field is unused.\nThe location where the application may present the SAML ").optional(),
    "destination_url": z.string().describe("If `override_recipient_and_destination` is set to `true`, this field is utilized for the SAML Response. If it is `false`, this field is unused.\nIdentifies the location where the SAML response is inten").optional(),
    "audience_url": z.string().describe("The intended audience of the SAML assertion. Often referred to as the service provider Entity ID.\n"),
    "default_relay_state": z.string().describe("Identifies a specific application resource in an IDP initiated Single Sign-On scenario. In most instances this is blank.\n"),
    "name_format": z.enum(["unspecified", "email_address", "x509_subject_name", "persistent", "transient", "entity", "kerberos", "windows_domain_qualified_name"]).describe("Name format of the assertion's subject statement. Processing rules and constraints can be applied based on selection. Default value is \"unspecified\" unless SP explicitly requires differently.\n"),
    "authentication_context": z.enum(["x509", "integrated_windows_federation", "kerberos", "password", "password_protected_transport", "tls_client", "unspecified", "refeds_mfa"]).describe("The SAML Authentication Context Class for the assertion's authentication statement. Default value is \"X509\".\n"),
    "subject_user_name_attribute": z.enum(["user_name", "email", "email_prefix", "external_id", "display_name", "custom", "none"]).describe("Determines the default value for a user's application username. The application username will be used for the assertion's subject statement.\n"),
    "sign_envelope": z.boolean().describe("Determines whether the SAML authentication response message is digitally signed by the IdP or not. A digital signature is required to ensure that only your IdP generated the response message.\n"),
    "sign_assertions": z.boolean().describe("All of the assertions should be signed by the IdP."),
    "signature_algorithm": z.enum(["rsa_sha256", "rsa_sha1", "rsa_sha384", "rsa_sha512"]).describe("The algorithm used for signing the SAML assertions.\n"),
    "digest_algorithm": z.enum(["sha256", "sha1", "sha384", "sha512"]).describe("The algorithm used to encrypt the SAML assertion.\n"),
    "encrypt_assertions": z.boolean().describe("This is the flag that determines if the SAML assertion is encrypted. If this flag is set to `true`, there **MUST** be a SAML encryption certificate uploaded.\nEncryption ensures that nobody but the sen"),
    "assertion_validity_duration_seconds": z.number().describe("The amount of time SAML assertions are valid for in seconds.\n"),
    "assertion_encryption_algorithm": z.enum(["aes256_cbc", "aes256_gcm", "aes128_cbc", "aes128_gcm"]).describe("The algorithm used for the digest in SAML assertions.\n").optional(),
    "assertion_key_transport_algorithm": z.enum(["rsa_oaep", "rsa1_5"]).describe("The algorithm used for key transport in SAML assertions.\n").optional(),
    "assertion_encryption_public_key": z.string().describe("The public key used to encrypt the SAML assertion. This is required if `encrypt_assertions` is true.\n").optional(),
    "sp_signature_certificates": z.array(z.object({
    "sp_public_signing_key": z.string(),
  })).describe("The PEM encoded X509 key certificate of the Service Provider used to verify SAML AuthnRequests.\n"),
    "enable_single_log_out": z.boolean().describe("Enables single logout. Single Logout (SLO) is a feature that allows users to be logged out from multiple service providers (SPs) and the identity provider (IdP) with a single logout action.\n"),
    "single_log_out_url": z.string().describe("The location where the single logout response will be sent.\nThis is only enabled if `enable_single_log_out` is true.\n").optional(),
    "single_log_out_issuer_url": z.string().describe("The issuer ID for the service provider when handling a Single Logout.\nThis is only enabled if `enable_single_log_out` is true.\n").optional(),
    "single_log_out_binding": z.enum(["post", "redirect"]).describe("The SAML binding used for SAML messages.\n").optional(),
    "single_logout_sign_request_and_response": z.boolean().describe("If enabled, Single Logout requests must bbe signed and Single Logout responses will also be signed.\n"),
    "validate_signed_requests": z.boolean().describe("Select this to validate all SAML requests using the SP Signature Certificate.\n"),
    "other_sso_urls": z.object({
    "index": z.number().describe("The index that this URL may be referenced by."),
    "url": z.string().describe("This is a URL that may be used to replace the ACS URL.\n"),
  }).describe("For use with SP-initiated sign-in flows. Enter the ACS URLs for any other requestable SSO nodes used by your app integration. This option enables applications to choose where to send the SAML Response").optional(),
    "additional_user_attributes": z.array(z.object({
    "name": z.string().describe("The SAML attribute name."),
    "name_format": z.enum(["unspecified", "email_address", "x509_subject_name", "persistent", "transient", "entity", "kerberos", "windows_domain_qualified_name"]).describe("Name format of the assertion's subject statement. Processing rules and constraints can be applied based on selection. Default value is \"unspecified\" unless SP explicitly requires differently.\n"),
    "value": z.enum(["email", "user_name", "external_id", "display_name", "custom_static_string"]).describe("The value to attach to the SAML value."),
    "custom_value": z.string().describe("The custom static string value when value is set to `custom_static_string`.\n").optional(),
  })).describe("This structure describes additional attributes that can be attached to SAML assertion.\n"),
    "use_short_url": z.boolean().describe("Changes the EntityID in the SAML response to a shorter version. This is to support applications with URL restrictions.").optional(),
  })]).optional(),
  }).describe("An application represents a client application that uses Beyond Identity for authentication. This could be a native app, a single-page application, regular web application, or machine-to-machine appli"),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/applications", {
        pathParams: { realm_id: params["realm_id"] as string },
        body: { "application": params["application"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "get_application",
    {
      description: "Retrieve a specific application by application_id. Returns the full application object including protocol configuration details.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "application_id": z.string().describe("A unique identifier for an application."),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/applications/{application_id}", {
        pathParams: { realm_id: params["realm_id"] as string, application_id: params["application_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "update_application",
    {
      description: "Update attributes of an application. Uses PATCH semantics. Cannot update system-managed applications (is_managed=true). Changes to protocol config may affect active authentication flows.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "application_id": z.string().describe("A unique identifier for an application."),
      "application": z.object({
    "resource_server_id": z.string().describe("A unique identifier for the application's resource server. At present, the only available resource server is for the Beyond Identity Management API. Referencing this resource server from an applicatio").optional(),
    "authenticator_config_id": z.string().describe("A unique identifier for the application's authenticator configuration. This field is unused for `oidc` and `oauth2` applications when `grant_type=client_credentials`.\n").optional(),
    "display_name": z.string().describe("A human-readable name for the application. This name is used for display purposes.\n").optional(),
    "protocol_config": z.union([z.object({
    "type": z.enum(["oauth2"]),
    "allowed_scopes": z.array(z.string()).describe("Scopes to which this application can grant access. If this application references a resource server, this set of scopes must be a subset of the resource server's available scopes. If this application ").optional(),
    "confidentiality": z.enum(["confidential", "public"]).describe("The confidentiality of the client, as prescribed by OAuth 2.0 and\nOIDC. Confidentiality is based on a client's ability to authenticate\nsecurely with the authorization server (i.e., ability to\nmaintain").optional(),
    "token_endpoint_auth_method": z.enum(["client_secret_basic", "client_secret_post", "none"]).describe("Indicator of the requested authentication method for the token endpoint.\nAllowable values are: - `client_secret_post`: The client uses the HTTP POST\nparameters\n   as defined in OAuth 2.0, Section 2.3.").optional(),
    "grant_type": z.array(z.enum(["authorization_code", "client_credentials"])).describe("Grant types supported by this application's `token` endpoint. Allowable values\nare:\n- `authorization_code`: The authorization code grant type defined\n  in OAuth 2.0, Section 4.1. Namely, the client ma").optional(),
    "redirect_uris": z.array(z.string()).describe("A list of valid URIs to redirect the resource owner's user-agent to after completing its interaction with the authorization server. See https://datatracker.ietf.org/doc/html/rfc6749#section-3.1.2 for ").optional(),
    "token_configuration": z.object({
    "expires_after": z.number().describe("Time after minting, in seconds, for which the token will be considered valid.\n"),
    "token_signing_algorithm": z.enum(["RS256"]).describe("Signing algorithm to use for an application token. The only allowable value at present is `RS256`.\n").optional(),
    "subject_field": z.enum(["id", "email", "username"]).describe("Property of a principal which is used to fill the subject of a token issued for this application.\n").optional(),
  }).describe("Properties of a token issued for an application.").optional(),
    "pkce": z.enum(["disabled", "plain", "s256"]).describe("PKCE code challenge methods supported for applications, as defined by\n[RFC-7636](https://datatracker.ietf.org/doc/html/rfc7636). Allowable values are:\n  - `disabled` : PKCE is disabled for this applic").optional(),
    "token_format": z.enum(["self_contained", "referential"]).describe("Allowed access token formats for this application.\ntoken type. Allowable values are:\n- `self_contained`: token in JWT format.\n- `referential`: Encoded token which requires /introspect\n   call in order").optional(),
  }).describe("OAuth2 protocol configuration."), z.object({
    "type": z.enum(["oidc"]),
    "allowed_scopes": z.array(z.string()).describe("Scopes to which this application can grant access. If this application references a resource server, this set of scopes must be a subset of the resource server's available scopes. If this application ").optional(),
    "confidentiality": z.enum(["confidential", "public"]).describe("The confidentiality of the client, as prescribed by OAuth 2.0 and\nOIDC. Confidentiality is based on a client's ability to authenticate\nsecurely with the authorization server (i.e., ability to\nmaintain").optional(),
    "token_endpoint_auth_method": z.enum(["client_secret_basic", "client_secret_post", "none"]).describe("Indicator of the requested authentication method for the token endpoint.\nAllowable values are: - `client_secret_post`: The client uses the HTTP POST\nparameters\n   as defined in OAuth 2.0, Section 2.3.").optional(),
    "grant_type": z.array(z.enum(["authorization_code", "client_credentials"])).describe("Grant types supported by this application's `token` endpoint. Allowable values\nare:\n- `authorization_code`: The authorization code grant type defined\n  in OAuth 2.0, Section 4.1. Namely, the client ma").optional(),
    "redirect_uris": z.array(z.string()).describe("A list of valid URIs to redirect the resource owner's user-agent to after completing its interaction with the authorization server. See https://datatracker.ietf.org/doc/html/rfc6749#section-3.1.2 for ").optional(),
    "token_configuration": z.object({
    "expires_after": z.number().describe("Time after minting, in seconds, for which the token will be considered valid.\n"),
    "token_signing_algorithm": z.enum(["RS256"]).describe("Signing algorithm to use for an application token. The only allowable value at present is `RS256`.\n").optional(),
    "subject_field": z.enum(["id", "email", "username"]).describe("Property of a principal which is used to fill the subject of a token issued for this application.\n").optional(),
  }).describe("Properties of a token issued for an application.").optional(),
    "pkce": z.enum(["disabled", "plain", "s256"]).describe("PKCE code challenge methods supported for applications, as defined by\n[RFC-7636](https://datatracker.ietf.org/doc/html/rfc7636). Allowable values are:\n  - `disabled` : PKCE is disabled for this applic").optional(),
    "token_format": z.enum(["self_contained", "referential"]).describe("Allowed access token formats for this application.\ntoken type. Allowable values are:\n- `self_contained`: token in JWT format.\n- `referential`: Encoded token which requires /introspect\n   call in order").optional(),
  }).describe("OIDC protocol configuration."), z.object({
    "type": z.enum(["saml"]),
    "acs_url": z.string().describe("Location where the SAML Response is sent via HTTP-POST. Often referred to as the SAML Assertion Consumer Service (ACS) URL.\n"),
    "override_recipient_and_destination": z.boolean().describe("When this is true, the `recipient_url` and the `destination_url` are used for SAML Response.\nWhen this is false, both the `recipient_url` and the `destination_url` are omitted and the `acs_url` is use"),
    "recipient_url": z.string().describe("If `override_recipient_and_destination` is set to `true`, this field is utilized for the SAML Response. If it is `false`, this field is unused.\nThe location where the application may present the SAML ").optional(),
    "destination_url": z.string().describe("If `override_recipient_and_destination` is set to `true`, this field is utilized for the SAML Response. If it is `false`, this field is unused.\nIdentifies the location where the SAML response is inten").optional(),
    "audience_url": z.string().describe("The intended audience of the SAML assertion. Often referred to as the service provider Entity ID.\n"),
    "default_relay_state": z.string().describe("Identifies a specific application resource in an IDP initiated Single Sign-On scenario. In most instances this is blank.\n"),
    "name_format": z.enum(["unspecified", "email_address", "x509_subject_name", "persistent", "transient", "entity", "kerberos", "windows_domain_qualified_name"]).describe("Name format of the assertion's subject statement. Processing rules and constraints can be applied based on selection. Default value is \"unspecified\" unless SP explicitly requires differently.\n"),
    "authentication_context": z.enum(["x509", "integrated_windows_federation", "kerberos", "password", "password_protected_transport", "tls_client", "unspecified", "refeds_mfa"]).describe("The SAML Authentication Context Class for the assertion's authentication statement. Default value is \"X509\".\n"),
    "subject_user_name_attribute": z.enum(["user_name", "email", "email_prefix", "external_id", "display_name", "custom", "none"]).describe("Determines the default value for a user's application username. The application username will be used for the assertion's subject statement.\n"),
    "sign_envelope": z.boolean().describe("Determines whether the SAML authentication response message is digitally signed by the IdP or not. A digital signature is required to ensure that only your IdP generated the response message.\n"),
    "sign_assertions": z.boolean().describe("All of the assertions should be signed by the IdP."),
    "signature_algorithm": z.enum(["rsa_sha256", "rsa_sha1", "rsa_sha384", "rsa_sha512"]).describe("The algorithm used for signing the SAML assertions.\n"),
    "digest_algorithm": z.enum(["sha256", "sha1", "sha384", "sha512"]).describe("The algorithm used to encrypt the SAML assertion.\n"),
    "encrypt_assertions": z.boolean().describe("This is the flag that determines if the SAML assertion is encrypted. If this flag is set to `true`, there **MUST** be a SAML encryption certificate uploaded.\nEncryption ensures that nobody but the sen"),
    "assertion_validity_duration_seconds": z.number().describe("The amount of time SAML assertions are valid for in seconds.\n"),
    "assertion_encryption_algorithm": z.enum(["aes256_cbc", "aes256_gcm", "aes128_cbc", "aes128_gcm"]).describe("The algorithm used for the digest in SAML assertions.\n").optional(),
    "assertion_key_transport_algorithm": z.enum(["rsa_oaep", "rsa1_5"]).describe("The algorithm used for key transport in SAML assertions.\n").optional(),
    "assertion_encryption_public_key": z.string().describe("The public key used to encrypt the SAML assertion. This is required if `encrypt_assertions` is true.\n").optional(),
    "sp_signature_certificates": z.array(z.object({
    "sp_public_signing_key": z.string(),
  })).describe("The PEM encoded X509 key certificate of the Service Provider used to verify SAML AuthnRequests.\n"),
    "enable_single_log_out": z.boolean().describe("Enables single logout. Single Logout (SLO) is a feature that allows users to be logged out from multiple service providers (SPs) and the identity provider (IdP) with a single logout action.\n"),
    "single_log_out_url": z.string().describe("The location where the single logout response will be sent.\nThis is only enabled if `enable_single_log_out` is true.\n").optional(),
    "single_log_out_issuer_url": z.string().describe("The issuer ID for the service provider when handling a Single Logout.\nThis is only enabled if `enable_single_log_out` is true.\n").optional(),
    "single_log_out_binding": z.enum(["post", "redirect"]).describe("The SAML binding used for SAML messages.\n").optional(),
    "single_logout_sign_request_and_response": z.boolean().describe("If enabled, Single Logout requests must bbe signed and Single Logout responses will also be signed.\n"),
    "validate_signed_requests": z.boolean().describe("Select this to validate all SAML requests using the SP Signature Certificate.\n"),
    "other_sso_urls": z.object({
    "index": z.number().describe("The index that this URL may be referenced by."),
    "url": z.string().describe("This is a URL that may be used to replace the ACS URL.\n"),
  }).describe("For use with SP-initiated sign-in flows. Enter the ACS URLs for any other requestable SSO nodes used by your app integration. This option enables applications to choose where to send the SAML Response").optional(),
    "additional_user_attributes": z.array(z.object({
    "name": z.string().describe("The SAML attribute name."),
    "name_format": z.enum(["unspecified", "email_address", "x509_subject_name", "persistent", "transient", "entity", "kerberos", "windows_domain_qualified_name"]).describe("Name format of the assertion's subject statement. Processing rules and constraints can be applied based on selection. Default value is \"unspecified\" unless SP explicitly requires differently.\n"),
    "value": z.enum(["email", "user_name", "external_id", "display_name", "custom_static_string"]).describe("The value to attach to the SAML value."),
    "custom_value": z.string().describe("The custom static string value when value is set to `custom_static_string`.\n").optional(),
  })).describe("This structure describes additional attributes that can be attached to SAML assertion.\n"),
    "use_short_url": z.boolean().describe("Changes the EntityID in the SAML response to a shorter version. This is to support applications with URL restrictions.").optional(),
  })]).optional(),
  }).describe("An application represents a client application that uses Beyond Identity for authentication. This could be a native app, a single-page application, regular web application, or machine-to-machine appli"),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "PATCH",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/applications/{application_id}", {
        pathParams: { realm_id: params["realm_id"] as string, application_id: params["application_id"] as string },
        body: { "application": params["application"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "delete_application",
    {
      description: "Permanently delete an application. Cannot delete system-managed applications. All tokens issued by this application become invalid after deletion. This cannot be undone.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "application_id": z.string().describe("A unique identifier for an application."),
      },
      annotations: { destructiveHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "DELETE",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/applications/{application_id}", {
        pathParams: { realm_id: params["realm_id"] as string, application_id: params["application_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "list_authenticator_configs",
    {
      description: "List all authenticator configurations in a realm. Returns config objects with type (embedded_sdk, hosted_web, platform). Pagination: page_size max 100, default 100. Authenticator configs define how users authenticate with an application.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "page_size": z.number().optional().describe("Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed b"),
      "page_token": z.string().optional().describe("Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"),
      "filter": z.string().optional().describe("Filter to constrain the response. The response will only include resources matching this filter. Filters follow the SCIM grammar from [RFC-7644 Section 3.4.2.2](https://datatracker.ietf.org/doc/html/r"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/authenticator-configs", {
        pathParams: { realm_id: params["realm_id"] as string },
        queryParams: { "page_size": params["page_size"] as string | number | boolean | undefined, "page_token": params["page_token"] as string | number | boolean | undefined, "filter": params["filter"] as string | number | boolean | undefined },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "create_authenticator_config",
    {
      description: "Create a new authenticator configuration. Requires display_name and a config object with type-specific fields. For embedded SDK: invoke_url (where the SDK is hosted) and trusted_origins array are required. For hosted_web: minimal configuration needed.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "authenticator_config": z.object({
    "display_name": z.string().describe("A human-readable name for the authenticator configuration. This name is used for display purposes.\n").optional(),
    "config": z.union([z.object({
    "invocation_type": z.enum(["automatic", "manual"]).describe("The method used to invoke the `invoke_url` in the embedded authenticator\nconfig type. The two methods available are:\n\nThe value `automatic` indicates that this invocation type automatically\nredirects ").optional(),
    "invoke_url": z.string().describe("URL to invoke during the authentication flow."),
    "trusted_origins": z.array(z.string()).describe("Trusted origins are URLs that will be allowed to make requests from a browser to the Beyond Identity API. This is used with Cross-Origin Resource Sharing (CORS). These may be in the form of `<scheme> "),
    "type": z.enum(["embedded"]),
    "authentication_methods": z.array(z.object({
    "type": z.enum(["email_one_time_password", "software_passkey", "webauthn_passkey"]).describe("Within our hosted web product, an array of values determines the\nclient-side authentication workflows:\n\nThe value `webauthn_passkey` triggers a workflow that generates a hardware\nkey within your devic"),
  })).optional(),
  }).describe("Configuration options for the embedded SDK authenticator."), z.object({
    "authentication_methods": z.array(z.object({
    "type": z.enum(["email_one_time_password", "software_passkey", "webauthn_passkey"]).describe("Within our hosted web product, an array of values determines the\nclient-side authentication workflows:\n\nThe value `webauthn_passkey` triggers a workflow that generates a hardware\nkey within your devic"),
  })),
    "trusted_origins": z.array(z.string()).describe("Trusted origins are URLs that will be allowed to make requests from a browser to the Beyond Identity API. This is used with Cross-Origin Resource Sharing (CORS). These may be in the form of `<scheme> "),
    "type": z.enum(["hosted_web"]),
  }).describe("Configuration options for the hosted web experience. This authenticator is maintained by Beyond Identity and allows the caller to customize authentication methods.\n"), z.object({
    "type": z.enum(["console"]),
    "onboarding_configuration": z.object({
    "verification_method": z.union([z.object({
    "type": z.any(),
    "idp_id": z.any(),
  }).describe("Configures IDP verification for identities onboarding."), z.object({
    "type": z.any(),
  }).describe("An onboarding configuration with no verification configured. Identities will not be verified during the onboarding operation.")]),
  }).describe("Configuration options for the console onboarding experience."),
  }).describe("Configuration options for credential enrollment, enabling an identity to access the Beyond Identity Console. These options support both IDP-authorized flows and non-verified enrollment pathways.\n"), z.object({
    "type": z.enum(["platform"]),
    "trusted_origins": z.array(z.string()).describe("Trusted origins are URLs that will be allowed to make requests from a browser to the Beyond Identity API. This is used with Cross-Origin Resource Sharing (CORS). These may be in the form of `<scheme> ").optional(),
    "roaming_auth_config": z.object({
    "enabled": z.boolean().describe("If false, roaming auth is never offered as an available flow during authentication on this Authenticator Config."),
    "allow_unknown_user": z.boolean().describe("If a login_hint is not provided or the login_hint does not match for exactly one user in the directory, the user will be considered \"unknown\" and the value of allow_unknown_user will be used to determ").optional(),
    "allowed_source_ips": z.array(z.string()).describe("If allowed_source_ips is not null and not empty, roaming auth will only be offered to users who begin the authentication from a specified IP address or range.").optional(),
    "allowed_user_group_ids": z.array(z.string()).describe("If allowed_user_group_ids is not nil and not empty, roaming auth will only be offered to users if they are part of one of those user groups. Note that the user is determined _before_ authentication us").optional(),
    "allowed_user_ids": z.array(z.string()).describe("If allowed_user_ids is not nil and not empty, roaming auth will only be offered to specified users. Note that the user is determined _before_ authentication using a best effort lookup by login_hint, i").optional(),
  }).describe("The roaming_auth_config offers advanced configuration options for the roaming auth feature.").optional(),
  }).describe("Configuration options for the platform authenticator.")]).optional(),
  }).describe("Representation of an authenticator configuration. This prescribes how an identity may authenticate themselves with Beyond Identity.\n"),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/authenticator-configs", {
        pathParams: { realm_id: params["realm_id"] as string },
        body: { "authenticator_config": params["authenticator_config"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "get_authenticator_config",
    {
      description: "Retrieve a specific authenticator configuration by authenticator_config_id. Returns the full config including type-specific settings.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "authenticator_config_id": z.string().describe("A unique identifier for an authenticator configuration."),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/authenticator-configs/{authenticator_config_id}", {
        pathParams: { realm_id: params["realm_id"] as string, authenticator_config_id: params["authenticator_config_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "update_authenticator_config",
    {
      description: "Update attributes of an authenticator configuration. Uses PATCH semantics. Changing config may affect active authentication flows for applications using this config.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "authenticator_config_id": z.string().describe("A unique identifier for an authenticator configuration."),
      "authenticator_config": z.object({
    "display_name": z.string().describe("A human-readable name for the authenticator configuration. This name is used for display purposes.\n").optional(),
    "config": z.union([z.object({
    "invocation_type": z.enum(["automatic", "manual"]).describe("The method used to invoke the `invoke_url` in the embedded authenticator\nconfig type. The two methods available are:\n\nThe value `automatic` indicates that this invocation type automatically\nredirects ").optional(),
    "invoke_url": z.string().describe("URL to invoke during the authentication flow."),
    "trusted_origins": z.array(z.string()).describe("Trusted origins are URLs that will be allowed to make requests from a browser to the Beyond Identity API. This is used with Cross-Origin Resource Sharing (CORS). These may be in the form of `<scheme> "),
    "type": z.enum(["embedded"]),
    "authentication_methods": z.array(z.object({
    "type": z.enum(["email_one_time_password", "software_passkey", "webauthn_passkey"]).describe("Within our hosted web product, an array of values determines the\nclient-side authentication workflows:\n\nThe value `webauthn_passkey` triggers a workflow that generates a hardware\nkey within your devic"),
  })).optional(),
  }).describe("Configuration options for the embedded SDK authenticator."), z.object({
    "authentication_methods": z.array(z.object({
    "type": z.enum(["email_one_time_password", "software_passkey", "webauthn_passkey"]).describe("Within our hosted web product, an array of values determines the\nclient-side authentication workflows:\n\nThe value `webauthn_passkey` triggers a workflow that generates a hardware\nkey within your devic"),
  })),
    "trusted_origins": z.array(z.string()).describe("Trusted origins are URLs that will be allowed to make requests from a browser to the Beyond Identity API. This is used with Cross-Origin Resource Sharing (CORS). These may be in the form of `<scheme> "),
    "type": z.enum(["hosted_web"]),
  }).describe("Configuration options for the hosted web experience. This authenticator is maintained by Beyond Identity and allows the caller to customize authentication methods.\n"), z.object({
    "type": z.enum(["console"]),
    "onboarding_configuration": z.object({
    "verification_method": z.union([z.object({
    "type": z.any(),
    "idp_id": z.any(),
  }).describe("Configures IDP verification for identities onboarding."), z.object({
    "type": z.any(),
  }).describe("An onboarding configuration with no verification configured. Identities will not be verified during the onboarding operation.")]),
  }).describe("Configuration options for the console onboarding experience."),
  }).describe("Configuration options for credential enrollment, enabling an identity to access the Beyond Identity Console. These options support both IDP-authorized flows and non-verified enrollment pathways.\n"), z.object({
    "type": z.enum(["platform"]),
    "trusted_origins": z.array(z.string()).describe("Trusted origins are URLs that will be allowed to make requests from a browser to the Beyond Identity API. This is used with Cross-Origin Resource Sharing (CORS). These may be in the form of `<scheme> ").optional(),
    "roaming_auth_config": z.object({
    "enabled": z.boolean().describe("If false, roaming auth is never offered as an available flow during authentication on this Authenticator Config."),
    "allow_unknown_user": z.boolean().describe("If a login_hint is not provided or the login_hint does not match for exactly one user in the directory, the user will be considered \"unknown\" and the value of allow_unknown_user will be used to determ").optional(),
    "allowed_source_ips": z.array(z.string()).describe("If allowed_source_ips is not null and not empty, roaming auth will only be offered to users who begin the authentication from a specified IP address or range.").optional(),
    "allowed_user_group_ids": z.array(z.string()).describe("If allowed_user_group_ids is not nil and not empty, roaming auth will only be offered to users if they are part of one of those user groups. Note that the user is determined _before_ authentication us").optional(),
    "allowed_user_ids": z.array(z.string()).describe("If allowed_user_ids is not nil and not empty, roaming auth will only be offered to specified users. Note that the user is determined _before_ authentication using a best effort lookup by login_hint, i").optional(),
  }).describe("The roaming_auth_config offers advanced configuration options for the roaming auth feature.").optional(),
  }).describe("Configuration options for the platform authenticator.")]).optional(),
  }).describe("Representation of an authenticator configuration. This prescribes how an identity may authenticate themselves with Beyond Identity.\n"),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "PATCH",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/authenticator-configs/{authenticator_config_id}", {
        pathParams: { realm_id: params["realm_id"] as string, authenticator_config_id: params["authenticator_config_id"] as string },
        body: { "authenticator_config": params["authenticator_config"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "delete_authenticator_config",
    {
      description: "Delete an authenticator configuration. Fails if any applications reference this config — remove the reference from all applications first. This cannot be undone.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "authenticator_config_id": z.string().describe("A unique identifier for an authenticator configuration."),
      },
      annotations: { destructiveHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "DELETE",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/authenticator-configs/{authenticator_config_id}", {
        pathParams: { realm_id: params["realm_id"] as string, authenticator_config_id: params["authenticator_config_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "list_resource_servers",
    {
      description: "List all resource servers in a realm. A resource server represents a protected API. Returns objects with id, identifier (audience URI), scopes array, and is_managed flag. Pagination: page_size max 100, default 100. The 'beyondidentity' identifier is reserved for the Management API.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "page_size": z.number().optional().describe("Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed b"),
      "page_token": z.string().optional().describe("Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers", {
        pathParams: { realm_id: params["realm_id"] as string },
        queryParams: { "page_size": params["page_size"] as string | number | boolean | undefined, "page_token": params["page_token"] as string | number | boolean | undefined },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "create_resource_server",
    {
      description: "Create a new resource server (protected API). Requires display_name, a unique identifier (used as the 'audience' claim in tokens, typically a URI), and a scopes array (e.g. [\"pets:read\", \"pets:write\"]). The identifier is immutable after creation. Cannot use the reserved 'beyondidentity' identifier.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "resource_server": z.object({
    "display_name": z.string().describe("A human-readable name for the resource server. This name is used for display purposes.\n").optional(),
    "identifier": z.string().describe("The identifier of this resource server entity. This value should be unique per realm and is often presented as a URI, as it should be a unique identifier for an API to which access is being gated. Thi").optional(),
    "scopes": z.array(z.string()).describe("The list of scopes supported by this resource server. For the Beyond Identity Management API, this will include scopes for all publicly available endpoints.  Note that applications may not provide acc").optional(),
  }).describe("A resource server represents an API server that hosts a set of protected resources and is capable of accepting and responding to protected resource requests using access tokens. Clients can enable the"),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers", {
        pathParams: { realm_id: params["realm_id"] as string },
        body: { "resource_server": params["resource_server"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "get_resource_server",
    {
      description: "Retrieve a specific resource server by resource_server_id. Returns the full object including scopes and configuration.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "resource_server_id": z.string().describe("A unique identifier for a resource server."),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers/{resource_server_id}", {
        pathParams: { realm_id: params["realm_id"] as string, resource_server_id: params["resource_server_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "update_resource_server",
    {
      description: "Update attributes of a resource server. Uses PATCH semantics. Cannot change the identifier or update system-managed servers. Changes to scopes may affect existing roles and applications.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "resource_server_id": z.string().describe("A unique identifier for a resource server."),
      "resource_server": z.object({
    "display_name": z.string().describe("A human-readable name for the resource server. This name is used for display purposes.\n").optional(),
    "identifier": z.string().describe("The identifier of this resource server entity. This value should be unique per realm and is often presented as a URI, as it should be a unique identifier for an API to which access is being gated. Thi").optional(),
    "scopes": z.array(z.string()).describe("The list of scopes supported by this resource server. For the Beyond Identity Management API, this will include scopes for all publicly available endpoints.  Note that applications may not provide acc").optional(),
  }).describe("A resource server represents an API server that hosts a set of protected resources and is capable of accepting and responding to protected resource requests using access tokens. Clients can enable the"),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "PATCH",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers/{resource_server_id}", {
        pathParams: { realm_id: params["realm_id"] as string, resource_server_id: params["resource_server_id"] as string },
        body: { "resource_server": params["resource_server"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "delete_resource_server",
    {
      description: "Delete a resource server. Cannot delete system-managed servers. All roles must be empty (no scopes or members) first, or the request fails. Applications referencing this server lose access.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "resource_server_id": z.string().describe("A unique identifier for a resource server."),
      },
      annotations: { destructiveHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "DELETE",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers/{resource_server_id}", {
        pathParams: { realm_id: params["realm_id"] as string, resource_server_id: params["resource_server_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "list_tokens",
    {
      description: "List tokens issued by a specific application. Requires application_id — use list_applications to find it. Optionally filter by principal_type and principal_id. Returns token metadata (id, subject, principal, issued_at, expires_at) but NOT the token values themselves. Pagination: page_size max 100.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "application_id": z.string().describe("A unique identifier for an application."),
      "principal_type": z.string().optional().describe("Type of the principal. Allowable values are:\n  - `application`\n  - `identity`\n"),
      "principal_id": z.string().optional().describe("A unique identifier for a principal. This might be an application ID or an identity ID depending on the type of principal."),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/applications/{application_id}/tokens", {
        pathParams: { realm_id: params["realm_id"] as string, application_id: params["application_id"] as string },
        queryParams: { "principal_type": params["principal_type"] as string | number | boolean | undefined, "principal_id": params["principal_id"] as string | number | boolean | undefined },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "revoke_token",
    {
      description: "Revoke a specific token by token_id, making it immediately unusable. Requires the application_id that issued the token. Revocation is irreversible. If you have the access token string but not the token_id, use the RFC-7009 revoke endpoint instead.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "application_id": z.string().describe("A unique identifier for an application."),
      "token_id": z.string().describe("A unique identifier for a token. For JWS tokens, this corresponds to the value of the `jti` token claim."),
      },
      annotations: { destructiveHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "DELETE",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/applications/{application_id}/tokens/{token_id}", {
        pathParams: { realm_id: params["realm_id"] as string, application_id: params["application_id"] as string, token_id: params["token_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "scim_list_users",
    {
      description: "List users via the SCIM v2.0 protocol. Supports SCIM filtering syntax and pagination (startIndex, count). Max 1000 results per page. Returns SCIM User resources with all standard and extension attributes.",
      inputSchema: {
      "realm_id": z.string().describe("The realm id"),
      "filter": z.string().optional().describe("Filter for list methods.\n\nFilters follow the SCIM grammar from\n[RFC 7644 Section 3.4.2.2](https://datatracker.ietf.org/doc/html/rfc7644#section-3.4.2.2).\n"),
      "count": z.number().optional().describe("Specifies the desired maximum number of query results per page. A negative value is treated as 0, which indicates that the response should not contain any resources. Note that the response may include"),
      "startIndex": z.number().optional().describe("The 1-based index of the first query result."),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Users", {
        pathParams: { realm_id: params["realm_id"] as string },
        queryParams: { "filter": params["filter"] as string | number | boolean | undefined, "count": params["count"] as string | number | boolean | undefined, "startIndex": params["startIndex"] as string | number | boolean | undefined },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "scim_create_user",
    {
      description: "Create a user via SCIM. Requires externalId, userName, displayName, active (boolean), name (givenName, familyName), and emails (at least one primary). On conflict (duplicate externalId/userName), the existing user is reactivated instead of failing.",
      inputSchema: {
      "realm_id": z.string().describe("The realm id"),
      "user": z.object({
    "schemas": z.array(z.string()).describe("The list of schemas used to define the user. This must contain only the core User schema (\"urn:ietf:params:scim:schemas:core:2.0:User\").\n"),
    "externalId": z.string().describe("The provisioning client's unique identifier for the resource.").optional(),
    "userName": z.string().describe("The unique username of the user.\n").optional(),
    "displayName": z.string().describe("Display name of the User. This name is used for display purposes.\n").optional(),
    "active": z.boolean().describe("Indicator for the user's administrative status. If true, the user has administrative capabilities.\n").optional(),
    "emails": z.array(z.object({
    "primary": z.boolean().describe("Indicator for the primary or preferred email address.\n\nOnly the primary email address is included on the response. All\nother provided email addresses will be ignored.\n").optional(),
    "value": z.string().describe("The email address.").optional(),
  }).describe("Definition of an email.")).describe("The list containing the user's emails.").optional(),
    "name": z.object({
    "givenName": z.string().describe("The given name of the user, or first name in most Western languages.\n").optional(),
    "familyName": z.string().describe("The family name of the user, or last name in most Western languages.\n").optional(),
  }).describe("Definition of the user's name.").optional(),
    "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User": z.object({
    "employeeNumber": z.string().describe("A string identifier, typically numeric or alphanumeric, assigned to a person, typically based on order of hire or association with an organization as defined in [RFC 7643](https://datatracker.ietf.org").optional(),
    "costCenter": z.string().describe("Identifies the name of a cost center as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n").optional(),
    "organization": z.string().describe("Identifies the name of an organization as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n").optional(),
    "department": z.string().describe("Identifies the name of a department as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n").optional(),
    "division": z.string().describe("Identifies the name of a division as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n").optional(),
    "manager": z.object({
    "value": z.string().describe("The \"id\" of the SCIM resource representing the user's manager as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n").optional(),
    "displayName": z.string().describe("The displayName of the user's manager. This attribute is OPTIONAL, and mutability is \"readOnly\" as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n").optional(),
  }).optional(),
  }).describe("Defines attributes commonly used in representing users that belong to, or act on behalf of, a business or enterprise. The enterprise User extension is identified using the following schema URI: \"urn:i").optional(),
    "meta": z.object({
    "resourceType": z.string().describe("The name of the resource type of the resource."),
  }).describe("Resource metadata as defined in [RFC 7643 Section 3.1](https://www.rfc-editor.org/rfc/rfc7643#section-3.1). This attribute is only populated on responses and is ignored on requests.\n").optional(),
  }).describe("A user represents a human entity as defined by [RFC 7643 Section 4.1](https://www.rfc-editor.org/rfc/rfc7643#section-4.1). A user cooresponds to the identity resource in Beyond Identity.\n"),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Users", {
        pathParams: { realm_id: params["realm_id"] as string },
        body: { "user": params["user"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "scim_get_user",
    {
      description: "Retrieve a specific SCIM user by user_id. Returns the full SCIM User resource with all attributes.",
      inputSchema: {
      "user_id": z.string().describe("ID of the user. This corresponds to the identity ID."),
      "realm_id": z.string().describe("The realm id"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Users/{user_id}", {
        pathParams: { user_id: params["user_id"] as string, realm_id: params["realm_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "scim_replace_user",
    {
      description: "Replace a SCIM user entirely (PUT semantics). All required fields must be provided — this is not a partial update. Uses ETag-based optimistic locking to prevent concurrent update conflicts.",
      inputSchema: {
      "user_id": z.string().describe("ID of the user. This corresponds to the identity ID."),
      "realm_id": z.string().describe("The realm id"),
      "user": z.object({
    "schemas": z.array(z.string()).describe("The list of schemas used to define the user. This must contain only the core User schema (\"urn:ietf:params:scim:schemas:core:2.0:User\").\n"),
    "externalId": z.string().describe("The provisioning client's unique identifier for the resource.").optional(),
    "userName": z.string().describe("The unique username of the user.\n").optional(),
    "displayName": z.string().describe("Display name of the User. This name is used for display purposes.\n").optional(),
    "active": z.boolean().describe("Indicator for the user's administrative status. If true, the user has administrative capabilities.\n").optional(),
    "emails": z.array(z.object({
    "primary": z.boolean().describe("Indicator for the primary or preferred email address.\n\nOnly the primary email address is included on the response. All\nother provided email addresses will be ignored.\n").optional(),
    "value": z.string().describe("The email address.").optional(),
  }).describe("Definition of an email.")).describe("The list containing the user's emails.").optional(),
    "name": z.object({
    "givenName": z.string().describe("The given name of the user, or first name in most Western languages.\n").optional(),
    "familyName": z.string().describe("The family name of the user, or last name in most Western languages.\n").optional(),
  }).describe("Definition of the user's name.").optional(),
    "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User": z.object({
    "employeeNumber": z.string().describe("A string identifier, typically numeric or alphanumeric, assigned to a person, typically based on order of hire or association with an organization as defined in [RFC 7643](https://datatracker.ietf.org").optional(),
    "costCenter": z.string().describe("Identifies the name of a cost center as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n").optional(),
    "organization": z.string().describe("Identifies the name of an organization as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n").optional(),
    "department": z.string().describe("Identifies the name of a department as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n").optional(),
    "division": z.string().describe("Identifies the name of a division as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n").optional(),
    "manager": z.object({
    "value": z.string().describe("The \"id\" of the SCIM resource representing the user's manager as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n").optional(),
    "displayName": z.string().describe("The displayName of the user's manager. This attribute is OPTIONAL, and mutability is \"readOnly\" as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n").optional(),
  }).optional(),
  }).describe("Defines attributes commonly used in representing users that belong to, or act on behalf of, a business or enterprise. The enterprise User extension is identified using the following schema URI: \"urn:i").optional(),
    "meta": z.object({
    "resourceType": z.string().describe("The name of the resource type of the resource."),
  }).describe("Resource metadata as defined in [RFC 7643 Section 3.1](https://www.rfc-editor.org/rfc/rfc7643#section-3.1). This attribute is only populated on responses and is ignored on requests.\n").optional(),
  }).describe("A user represents a human entity as defined by [RFC 7643 Section 4.1](https://www.rfc-editor.org/rfc/rfc7643#section-4.1). A user cooresponds to the identity resource in Beyond Identity.\n"),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "PUT",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Users/{user_id}", {
        pathParams: { user_id: params["user_id"] as string, realm_id: params["realm_id"] as string },
        body: { "user": params["user"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "scim_update_user",
    {
      description: "Partially update a SCIM user via PATCH operations (add, remove, replace). Operations are executed in order. Supports optimistic locking via version headers.",
      inputSchema: {
      "user_id": z.string().describe("ID of the user. This corresponds to the identity ID."),
      "realm_id": z.string().describe("The realm id"),
      "user": z.object({
    "schemas": z.array(z.string()).describe("The list of schemas used to define the user. This must contain only the core User schema (\"urn:ietf:params:scim:schemas:core:2.0:User\").\n"),
    "externalId": z.string().describe("The provisioning client's unique identifier for the resource.").optional(),
    "userName": z.string().describe("The unique username of the user.\n").optional(),
    "displayName": z.string().describe("Display name of the User. This name is used for display purposes.\n").optional(),
    "active": z.boolean().describe("Indicator for the user's administrative status. If true, the user has administrative capabilities.\n").optional(),
    "emails": z.array(z.object({
    "primary": z.boolean().describe("Indicator for the primary or preferred email address.\n\nOnly the primary email address is included on the response. All\nother provided email addresses will be ignored.\n").optional(),
    "value": z.string().describe("The email address.").optional(),
  }).describe("Definition of an email.")).describe("The list containing the user's emails.").optional(),
    "name": z.object({
    "givenName": z.string().describe("The given name of the user, or first name in most Western languages.\n").optional(),
    "familyName": z.string().describe("The family name of the user, or last name in most Western languages.\n").optional(),
  }).describe("Definition of the user's name.").optional(),
    "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User": z.object({
    "employeeNumber": z.string().describe("A string identifier, typically numeric or alphanumeric, assigned to a person, typically based on order of hire or association with an organization as defined in [RFC 7643](https://datatracker.ietf.org").optional(),
    "costCenter": z.string().describe("Identifies the name of a cost center as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n").optional(),
    "organization": z.string().describe("Identifies the name of an organization as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n").optional(),
    "department": z.string().describe("Identifies the name of a department as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n").optional(),
    "division": z.string().describe("Identifies the name of a division as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n").optional(),
    "manager": z.object({
    "value": z.string().describe("The \"id\" of the SCIM resource representing the user's manager as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n").optional(),
    "displayName": z.string().describe("The displayName of the user's manager. This attribute is OPTIONAL, and mutability is \"readOnly\" as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n").optional(),
  }).optional(),
  }).describe("Defines attributes commonly used in representing users that belong to, or act on behalf of, a business or enterprise. The enterprise User extension is identified using the following schema URI: \"urn:i").optional(),
    "meta": z.object({
    "resourceType": z.string().describe("The name of the resource type of the resource."),
  }).describe("Resource metadata as defined in [RFC 7643 Section 3.1](https://www.rfc-editor.org/rfc/rfc7643#section-3.1). This attribute is only populated on responses and is ignored on requests.\n").optional(),
  }).describe("A user represents a human entity as defined by [RFC 7643 Section 4.1](https://www.rfc-editor.org/rfc/rfc7643#section-4.1). A user cooresponds to the identity resource in Beyond Identity.\n"),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "PATCH",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Users/{user_id}", {
        pathParams: { user_id: params["user_id"] as string, realm_id: params["realm_id"] as string },
        body: { "user": params["user"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "scim_delete_user",
    {
      description: "Delete a SCIM user. Removes the user from all groups. Depending on configuration, may be a soft or hard delete.",
      inputSchema: {
      "user_id": z.string().describe("ID of the user. This corresponds to the identity ID."),
      "realm_id": z.string().describe("The realm id"),
      },
      annotations: { destructiveHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "DELETE",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Users/{user_id}", {
        pathParams: { user_id: params["user_id"] as string, realm_id: params["realm_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "scim_list_groups",
    {
      description: "List groups via the SCIM v2.0 protocol. Returns Group resources with displayName, externalId, members array, and Beyond Identity extensions (description). Permission groups cannot be created or modified via SCIM.",
      inputSchema: {
      "realm_id": z.string().describe("The realm id"),
      "filter": z.string().optional().describe("Filter for list methods.\n\nFilters follow the SCIM grammar from\n[RFC 7644 Section 3.4.2.2](https://datatracker.ietf.org/doc/html/rfc7644#section-3.4.2.2).\n"),
      "count": z.number().optional().describe("Specifies the desired maximum number of query results per page. A negative value is treated as 0, which indicates that the response should not contain any resources. Note that the response may include"),
      "startIndex": z.number().optional().describe("The 1-based index of the first query result."),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Groups/", {
        pathParams: { realm_id: params["realm_id"] as string },
        queryParams: { "filter": params["filter"] as string | number | boolean | undefined, "count": params["count"] as string | number | boolean | undefined, "startIndex": params["startIndex"] as string | number | boolean | undefined },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "scim_create_group",
    {
      description: "Create a group via SCIM. Requires displayName. Cannot use reserved permission group names. Optionally include members (array of user IDs) and description. All member IDs must reference existing users.",
      inputSchema: {
      "realm_id": z.string().describe("The realm id"),
      "group": z.object({
    "schemas": z.array(z.string()).describe("The list of schemas used to define the group. This must contain the core Group schema (\"urn:ietf:params:scim:schemas:core:2.0:Group\") and may include the custom Beyond Identity Group schema extension "),
    "displayName": z.string().describe("The unique display name of the group. This name is used for display purposes.\n").optional(),
    "meta": z.object({
    "resourceType": z.string().describe("The name of the resource type of the resource."),
  }).describe("Resource metadata as defined in [RFC 7643 Section 3.1](https://www.rfc-editor.org/rfc/rfc7643#section-3.1). This attribute is only populated on responses and is ignored on requests.\n").optional(),
  }).describe("A group is a collection of users corresponding to [RFC 7643 Section 4.2](https://www.rfc-editor.org/rfc/rfc7643#section-4.2).\n"),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Groups/", {
        pathParams: { realm_id: params["realm_id"] as string },
        body: { "group": params["group"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "scim_get_group",
    {
      description: "Retrieve a specific SCIM group by group_id. Returns the full SCIM Group resource including members array.",
      inputSchema: {
      "group_id": z.string().describe("ID of the group."),
      "realm_id": z.string().describe("The realm id"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Groups/{group_id}", {
        pathParams: { group_id: params["group_id"] as string, realm_id: params["realm_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "scim_update_group",
    {
      description: "Partially update a SCIM group via PATCH operations. Supports adding/removing members. Member operations are subject to a max batch size limit.",
      inputSchema: {
      "group_id": z.string().describe("ID of the group."),
      "realm_id": z.string().describe("The realm id"),
      "group": z.object({
    "schemas": z.array(z.string()).describe("The list of schemas used to define the group. This must contain the core Group schema (\"urn:ietf:params:scim:schemas:core:2.0:Group\") and may include the custom Beyond Identity Group schema extension "),
    "displayName": z.string().describe("The unique display name of the group. This name is used for display purposes.\n").optional(),
    "meta": z.object({
    "resourceType": z.string().describe("The name of the resource type of the resource."),
  }).describe("Resource metadata as defined in [RFC 7643 Section 3.1](https://www.rfc-editor.org/rfc/rfc7643#section-3.1). This attribute is only populated on responses and is ignored on requests.\n").optional(),
  }).describe("A group is a collection of users corresponding to [RFC 7643 Section 4.2](https://www.rfc-editor.org/rfc/rfc7643#section-4.2).\n"),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "PATCH",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Groups/{group_id}", {
        pathParams: { group_id: params["group_id"] as string, realm_id: params["realm_id"] as string },
        body: { "group": params["group"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "scim_delete_group",
    {
      description: "Delete a SCIM group. Cannot delete reserved permission groups. Automatically removes the group from all member users.",
      inputSchema: {
      "group_id": z.string().describe("ID of the group."),
      "realm_id": z.string().describe("The realm id"),
      },
      annotations: { destructiveHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "DELETE",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Groups/{group_id}", {
        pathParams: { group_id: params["group_id"] as string, realm_id: params["realm_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "list_resource_types",
    {
      description: "List SCIM resource types supported by this server. Returns metadata describing the User and Group schemas, endpoints, and supported operations. This is a fixed server-capability endpoint, not tenant-specific.",
      inputSchema: {
      "realm_id": z.string().describe("The realm id"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/ResourceTypes", {
        pathParams: { realm_id: params["realm_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "list_schemas",
    {
      description: "List all SCIM schemas supported by this server, including core schemas (User, Group) and extensions (Enterprise User, Beyond Identity). This is a fixed server-capability endpoint.",
      inputSchema: {
      "realm_id": z.string().describe("The realm id"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Schemas", {
        pathParams: { realm_id: params["realm_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "get_service_provider_config",
    {
      description: "Get the SCIM service provider configuration describing server capabilities: authentication methods, filtering support, patch support, and max results (1000). This is a fixed server-capability endpoint.",
      inputSchema: {
      "realm_id": z.string().describe("The realm id"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/ServiceProviderConfig", {
        pathParams: { realm_id: params["realm_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "list_sso_configs",
    {
      description: "List all SSO configurations in a realm. Returns SsoConfig objects with protocol-specific payloads (OIDC, SAML). Supports filtering and ordering. Internal admin console configs are automatically excluded from results.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "page_size": z.number().optional().describe("Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed b"),
      "page_token": z.string().optional().describe("Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"),
      "type": z.array(z.enum(["bookmark", "entra_id_external_auth_methods", "generic_oidc", "generic_oidc_idp", "generic_saml", "okta_idp", "okta_sso_bi_idp", "scim", "ws_fed"]).describe("Describes the type of sso config.\n")).optional().describe("The type of sso config to filter by. You may query with multiple types for example \"/sso-configs?type=generic_oidc&type=generic_oid_idp\""),
      "is_migrated": z.boolean().optional().describe("is_migrated"),
      "order_by": z.string().optional().describe("order_by"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/sso-configs", {
        pathParams: { realm_id: params["realm_id"] as string },
        queryParams: { "page_size": params["page_size"] as string | number | boolean | undefined, "page_token": params["page_token"] as string | number | boolean | undefined, "type": params["type"] as string | number | boolean | undefined, "is_migrated": params["is_migrated"] as string | number | boolean | undefined, "order_by": params["order_by"] as string | number | boolean | undefined },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "create_sso_config",
    {
      description: "Create a new SSO configuration for a realm. Requires display_name and a protocol-specific payload. Returns the new config with an auto-generated id. Use add_identities_to_sso_config or add_groups_to_sso_config to control which users can access this SSO app.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "sso_config": z.object({
    "is_migrated": z.boolean().describe("Indicates that the SSO Config was added by a script such as fast migrate").optional(),
    "display_name": z.string().describe("A human-readable name for the application. This name is used for display purposes."),
    "payload": z.union([z.object({
    "type": z.enum(["bookmark", "entra_id_external_auth_methods", "generic_oidc", "generic_oidc_idp", "generic_saml", "okta_idp", "okta_sso_bi_idp", "scim", "ws_fed"]).describe("Describes the type of sso config.\n"),
    "login_link": z.string(),
    "icon": z.string().optional(),
    "is_tile_visible": z.boolean().optional(),
  }), z.object({
    "type": z.enum(["bookmark", "entra_id_external_auth_methods", "generic_oidc", "generic_oidc_idp", "generic_saml", "okta_idp", "okta_sso_bi_idp", "scim", "ws_fed"]).describe("Describes the type of sso config.\n"),
    "redirect_uris": z.array(z.string()),
    "inbound_scim": z.record(z.any()).optional(),
    "discover_endpoint": z.enum(["global_azure", "azure_us_government", "microsoft_azure_vianet"]).describe("Describes the type of discovery endpoint for the entra_id_external_auth_methods sso config.\n"),
  }), z.object({
    "type": z.enum(["bookmark", "entra_id_external_auth_methods", "generic_oidc", "generic_oidc_idp", "generic_saml", "okta_idp", "okta_sso_bi_idp", "scim", "ws_fed"]).describe("Describes the type of sso config.\n"),
    "redirect_uris": z.array(z.string()),
    "scopes": z.array(z.string()),
    "trusted_origins": z.array(z.string()).optional(),
    "login_link": z.string().optional(),
    "icon": z.string().optional(),
    "is_tile_visible": z.boolean().optional(),
    "confidentiality": z.any(),
    "pkce": z.any(),
    "inbound_scim": z.record(z.any()).optional(),
  }), z.object({
    "type": z.enum(["bookmark", "entra_id_external_auth_methods", "generic_oidc", "generic_oidc_idp", "generic_saml", "okta_idp", "okta_sso_bi_idp", "scim", "ws_fed"]).describe("Describes the type of sso config.\n"),
    "client_id": z.string().describe("The client ID for the idp application."),
    "identifying_claim_name": z.string(),
    "identity_attribute": z.enum(["id", "email", "username", "external_id"]).describe("Defines which field should be used to populate the subject field of an id token.\n- `id` - The user ID is used.\n- `email` - The user email is used.\n- `username` - The username is used.\n"),
    "authorization_endpoint": z.string(),
    "token_endpoint": z.string(),
    "jwks_endpoint": z.string(),
  }), z.object({
    "type": z.enum(["saml"]),
    "acs_url": z.string().describe("Location where the SAML Response is sent via HTTP-POST. Often referred to as the SAML Assertion Consumer Service (ACS) URL.\n"),
    "override_recipient_and_destination": z.boolean().describe("When this is true, the `recipient_url` and the `destination_url` are used for SAML Response.\nWhen this is false, both the `recipient_url` and the `destination_url` are omitted and the `acs_url` is use"),
    "recipient_url": z.string().describe("If `override_recipient_and_destination` is set to `true`, this field is utilized for the SAML Response. If it is `false`, this field is unused.\nThe location where the application may present the SAML ").optional(),
    "destination_url": z.string().describe("If `override_recipient_and_destination` is set to `true`, this field is utilized for the SAML Response. If it is `false`, this field is unused.\nIdentifies the location where the SAML response is inten").optional(),
    "audience_url": z.string().describe("The intended audience of the SAML assertion. Often referred to as the service provider Entity ID.\n"),
    "default_relay_state": z.string().describe("Identifies a specific application resource in an IDP initiated Single Sign-On scenario. In most instances this is blank.\n"),
    "name_format": z.enum(["unspecified", "email_address", "x509_subject_name", "persistent", "transient", "entity", "kerberos", "windows_domain_qualified_name"]).describe("Name format of the assertion's subject statement. Processing rules and constraints can be applied based on selection. Default value is \"unspecified\" unless SP explicitly requires differently.\n"),
    "authentication_context": z.enum(["x509", "integrated_windows_federation", "kerberos", "password", "password_protected_transport", "tls_client", "unspecified", "refeds_mfa"]).describe("The SAML Authentication Context Class for the assertion's authentication statement. Default value is \"X509\".\n"),
    "subject_user_name_attribute": z.enum(["user_name", "email", "email_prefix", "external_id", "display_name", "custom", "none"]).describe("Determines the default value for a user's application username. The application username will be used for the assertion's subject statement.\n"),
    "sign_envelope": z.boolean().describe("Determines whether the SAML authentication response message is digitally signed by the IdP or not. A digital signature is required to ensure that only your IdP generated the response message.\n"),
    "sign_assertions": z.boolean().describe("All of the assertions should be signed by the IdP."),
    "signature_algorithm": z.enum(["rsa_sha256", "rsa_sha1", "rsa_sha384", "rsa_sha512"]).describe("The algorithm used for signing the SAML assertions.\n"),
    "digest_algorithm": z.enum(["sha256", "sha1", "sha384", "sha512"]).describe("The algorithm used to encrypt the SAML assertion.\n"),
    "encrypt_assertions": z.boolean().describe("This is the flag that determines if the SAML assertion is encrypted. If this flag is set to `true`, there **MUST** be a SAML encryption certificate uploaded.\nEncryption ensures that nobody but the sen"),
    "assertion_validity_duration_seconds": z.number().describe("The amount of time SAML assertions are valid for in seconds.\n"),
    "assertion_encryption_algorithm": z.enum(["aes256_cbc", "aes256_gcm", "aes128_cbc", "aes128_gcm"]).describe("The algorithm used for the digest in SAML assertions.\n").optional(),
    "assertion_key_transport_algorithm": z.enum(["rsa_oaep", "rsa1_5"]).describe("The algorithm used for key transport in SAML assertions.\n").optional(),
    "assertion_encryption_public_key": z.string().describe("The public key used to encrypt the SAML assertion. This is required if `encrypt_assertions` is true.\n").optional(),
    "sp_signature_certificates": z.array(z.object({
    "sp_public_signing_key": z.string(),
  })).describe("The PEM encoded X509 key certificate of the Service Provider used to verify SAML AuthnRequests.\n"),
    "enable_single_log_out": z.boolean().describe("Enables single logout. Single Logout (SLO) is a feature that allows users to be logged out from multiple service providers (SPs) and the identity provider (IdP) with a single logout action.\n"),
    "single_log_out_url": z.string().describe("The location where the single logout response will be sent.\nThis is only enabled if `enable_single_log_out` is true.\n").optional(),
    "single_log_out_issuer_url": z.string().describe("The issuer ID for the service provider when handling a Single Logout.\nThis is only enabled if `enable_single_log_out` is true.\n").optional(),
    "single_log_out_binding": z.enum(["post", "redirect"]).describe("The SAML binding used for SAML messages.\n").optional(),
    "single_logout_sign_request_and_response": z.boolean().describe("If enabled, Single Logout requests must bbe signed and Single Logout responses will also be signed.\n"),
    "validate_signed_requests": z.boolean().describe("Select this to validate all SAML requests using the SP Signature Certificate.\n"),
    "other_sso_urls": z.object({
    "index": z.number().describe("The index that this URL may be referenced by."),
    "url": z.string().describe("This is a URL that may be used to replace the ACS URL.\n"),
  }).describe("For use with SP-initiated sign-in flows. Enter the ACS URLs for any other requestable SSO nodes used by your app integration. This option enables applications to choose where to send the SAML Response").optional(),
    "additional_user_attributes": z.array(z.object({
    "name": z.string().describe("The SAML attribute name."),
    "name_format": z.enum(["unspecified", "email_address", "x509_subject_name", "persistent", "transient", "entity", "kerberos", "windows_domain_qualified_name"]).describe("Name format of the assertion's subject statement. Processing rules and constraints can be applied based on selection. Default value is \"unspecified\" unless SP explicitly requires differently.\n"),
    "value": z.enum(["email", "user_name", "external_id", "display_name", "custom_static_string"]).describe("The value to attach to the SAML value."),
    "custom_value": z.string().describe("The custom static string value when value is set to `custom_static_string`.\n").optional(),
  })).describe("This structure describes additional attributes that can be attached to SAML assertion.\n"),
    "use_short_url": z.boolean().describe("Changes the EntityID in the SAML response to a shorter version. This is to support applications with URL restrictions.").optional(),
  }), z.object({
    "type": z.enum(["bookmark", "entra_id_external_auth_methods", "generic_oidc", "generic_oidc_idp", "generic_saml", "okta_idp", "okta_sso_bi_idp", "scim", "ws_fed"]).describe("Describes the type of sso config.\n"),
    "client_id": z.string().describe("The client ID for the idp application."),
    "client_secret": z.string().describe("The client secret to authenticate as the idp application.").optional(),
    "pkce": z.any().optional(),
    "id_token_scopes": z.array(z.string()).optional(),
    "identifying_claim_name": z.string(),
    "identity_attribute": z.enum(["id", "email", "username", "external_id"]).describe("Defines which field should be used to populate the subject field of an id token.\n- `id` - The user ID is used.\n- `email` - The user email is used.\n- `username` - The username is used.\n"),
    "okta_domain": z.string(),
    "inbound_scim": z.record(z.any()).optional(),
  }), z.object({
    "type": z.enum(["bookmark", "entra_id_external_auth_methods", "generic_oidc", "generic_oidc_idp", "generic_saml", "okta_idp", "okta_sso_bi_idp", "scim", "ws_fed"]).describe("Describes the type of sso config.\n"),
    "pkce": z.any(),
    "okta_registration": z.object({
    "domain": z.string().describe("The domain Url inside of Okta.").optional(),
    "okta_token": z.string().describe("An okta token used for accessing the okta API.").optional(),
    "attribute_name": z.string().describe("The name of the attribute within okta that we are going to set to\ntrue.").optional(),
    "is_enabled": z.boolean().describe("If the integration is enabled.").optional(),
  }).describe("Represents a list of Resource Servers as a response body."),
    "inbound_scim": z.record(z.any()).optional(),
  }), z.object({
    "type": z.enum(["bookmark", "entra_id_external_auth_methods", "generic_oidc", "generic_oidc_idp", "generic_saml", "okta_idp", "okta_sso_bi_idp", "scim", "ws_fed"]).describe("Describes the type of sso config.\n"),
    "company_identifier": z.string(),
  }), z.object({
    "type": z.enum(["bookmark", "entra_id_external_auth_methods", "generic_oidc", "generic_oidc_idp", "generic_saml", "okta_idp", "okta_sso_bi_idp", "scim", "ws_fed"]).describe("Describes the type of sso config.\n"),
    "acs_url": z.string().describe("This is where to redirect to. This is also known as the SP SSO url.\n"),
    "audience_url": z.string().describe("The Recipient/Audience of the RSTR."),
    "expiration_time_seconds": z.number().describe("The amount of time in seconds that the RSTR should be valid for."),
    "digest_algorithm": z.enum(["sha256", "sha1", "sha384", "sha512"]).describe("The algorithm used to create a digest inside of the token within the RSTR."),
    "signature_algorithm": z.enum(["rsa_sha256", "rsa_sha1", "rsa_sha384", "rsa_sha512"]).describe("The algorithm used to create a signature inside of the token within the RSTR."),
    "name_format": z.enum(["unspecified", "email_address", "x509_subject_name", "persistent", "transient", "entity", "kerberos", "windows_domain_qualified_name"]).describe("Name format of the assertion's subject statement. Processing rules and constraints can be applied based on selection. Default value is \"unspecified\" unless SP explicitly requires differently.\n"),
    "subject_user_name_attribute": z.enum(["user_name", "email", "email_prefix", "external_id", "display_name", "custom", "none"]).describe("The attribute on the identity that's used to uniquely identify the user.\nThis is also the source for the user name inside of the RSTR.\n"),
    "authentication_context": z.enum(["x509", "integrated_windows_federation", "kerberos", "password", "password_protected_transport", "tls_client", "unspecified", "refeds_mfa"]).describe("The SAML Authentication Context Class for the assertion's authentication statement.\nDefault value is \"X509\".\n"),
    "additional_user_attributes": z.array(z.object({
    "name": z.string().describe("The SAML attribute name."),
    "name_format": z.enum(["unspecified", "email_address", "x509_subject_name", "persistent", "transient", "entity", "kerberos", "windows_domain_qualified_name"]).describe("Name format of the assertion's subject statement. Processing rules and constraints can be applied based on selection. Default value is \"unspecified\" unless SP explicitly requires differently.\n"),
    "value": z.enum(["email", "user_name", "external_id", "display_name", "custom_static_string"]).describe("The value to attach to the SAML value."),
    "namespace": z.string().describe("This is an XML namespace that is applied the attribute and all of\nits children.\n").optional(),
  }).describe("This structure describes additional attributes that can be\nattached to SAML assertion inside of WS-Fed token.\n")).describe("Any additional attributes to attach to the assertion."),
    "icon": z.string().describe("The URL or data URI of the icon representing the SSO configuration.").optional(),
    "is_tile_visible": z.boolean().describe("Indicates if the SSO configuration tile is visible to the user.").optional(),
    "inbound_scim": z.record(z.any()).optional(),
  })]),
  }).describe("Represents an SSO config as a request body."),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/sso-configs", {
        pathParams: { realm_id: params["realm_id"] as string },
        body: { "sso_config": params["sso_config"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "get_sso_config",
    {
      description: "Retrieve a specific SSO configuration by sso_config_id. Returns the full config including protocol payload. Internal admin console configs are not accessible via this endpoint.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "sso_config_id": z.string().describe("A unique identifier of the sso configuration"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/sso-configs/{sso_config_id}", {
        pathParams: { realm_id: params["realm_id"] as string, sso_config_id: params["sso_config_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "update_sso_config",
    {
      description: "Update an SSO configuration. Cannot change the payload type after creation. Uses PATCH semantics — omitted fields unchanged.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "sso_config_id": z.string().describe("A unique identifier of the sso configuration"),
      "sso_config": z.union([z.object({
    "type": z.enum(["bookmark", "entra_id_external_auth_methods", "generic_oidc", "generic_oidc_idp", "generic_saml", "okta_idp", "okta_sso_bi_idp", "scim", "ws_fed"]).describe("Describes the type of sso config.\n"),
    "login_link": z.string().optional(),
    "icon": z.string().optional(),
    "is_tile_visible": z.boolean().optional(),
  }), z.object({
    "type": z.enum(["bookmark", "entra_id_external_auth_methods", "generic_oidc", "generic_oidc_idp", "generic_saml", "okta_idp", "okta_sso_bi_idp", "scim", "ws_fed"]).describe("Describes the type of sso config.\n"),
    "redirect_uris": z.array(z.string()).optional(),
    "inbound_scim": z.record(z.any()).optional(),
    "discover_endpoint": z.enum(["global_azure", "azure_us_government", "microsoft_azure_vianet"]).describe("Describes the type of discovery endpoint for the entra_id_external_auth_methods sso config.\n").optional(),
  }), z.object({
    "type": z.enum(["bookmark", "entra_id_external_auth_methods", "generic_oidc", "generic_oidc_idp", "generic_saml", "okta_idp", "okta_sso_bi_idp", "scim", "ws_fed"]).describe("Describes the type of sso config.\n"),
    "redirect_uris": z.array(z.string()).optional(),
    "scopes": z.array(z.string()).optional(),
    "trusted_origins": z.array(z.string()).optional(),
    "login_link": z.string().optional(),
    "icon": z.string().optional(),
    "is_tile_visible": z.boolean().optional(),
    "confidentiality": z.any().optional(),
    "pkce": z.any().optional(),
    "inbound_scim": z.record(z.any()).optional(),
  }), z.object({
    "type": z.enum(["bookmark", "entra_id_external_auth_methods", "generic_oidc", "generic_oidc_idp", "generic_saml", "okta_idp", "okta_sso_bi_idp", "scim", "ws_fed"]).describe("Describes the type of sso config.\n"),
    "client_id": z.string().describe("The client ID for the idp application.").optional(),
    "client_secret": z.string().describe("The client secret to authenticate as the idp application.").optional(),
    "pkce": z.any().optional(),
    "id_token_scopes": z.array(z.string()).optional(),
    "identifying_claim_name": z.string().optional(),
    "identity_attribute": z.enum(["id", "email", "username", "external_id"]).describe("Defines which field should be used to populate the subject field of an id token.\n- `id` - The user ID is used.\n- `email` - The user email is used.\n- `username` - The username is used.\n").optional(),
    "authorization_endpoint": z.string().optional(),
    "token_endpoint": z.string().optional(),
    "jwks_endpoint": z.string().optional(),
  }), z.object({
    "type": z.enum(["bookmark", "entra_id_external_auth_methods", "generic_oidc", "generic_oidc_idp", "generic_saml", "okta_idp", "okta_sso_bi_idp", "scim", "ws_fed"]).describe("Describes the type of sso config.\n"),
    "acs_url": z.string().describe("Location where the SAML Response is sent via HTTP-POST. Often referred\nto as the SAML Assertion Consumer Service (ACS) URL.\n").optional(),
    "override_recipient_and_destination": z.boolean().describe("When this is true, the `recipient_url` and the `destination_url` are\nused for SAML Response.\n\nWhen this is false, both the `recipient_url` and the `destination_url`\nare omitted and the acs_url is used").optional(),
    "recipient_url": z.string().describe("If `override_recipient_and_destination` is set to true, this field is\nutilized for the SAML Response. If it is false, this field is unused.\n\nThe location where the application can present the SAML ass").optional(),
    "destination_url": z.string().describe("If `override_recipient_and_destination` is set to true, this field is\nutilized for the SAML Response. If it is false, this field is unused.\n\nThe location to send the SAML Response, as defined in the S").optional(),
    "audience_url": z.string().describe("The intended audience of the SAML assertion. Often referred to as the\nservice provider Entity ID.\n").optional(),
    "default_relay_state": z.string().describe("Identifies a specific application resource in an IDP initiated Single\nSign-On scenario. In most instances this is blank.\n").optional(),
    "name_format": z.enum(["unspecified", "email_address", "x509_subject_name", "persistent", "transient", "entity", "kerberos", "windows_domain_qualified_name"]).describe("Name format of the assertion's subject statement. Processing rules and constraints can be applied based on selection. Default value is \"unspecified\" unless SP explicitly requires differently.\n").optional(),
    "authentication_context": z.enum(["x509", "integrated_windows_federation", "kerberos", "password", "password_protected_transport", "tls_client", "unspecified", "refeds_mfa"]).describe("The SAML Authentication Context Class for the assertion's authentication statement. Default value is \"X509\".\n").optional(),
    "subject_user_name_attribute": z.enum(["user_name", "email", "email_prefix", "external_id", "display_name", "custom", "none"]).describe("Determines the default value for a user's application username. The application username will be used for the assertion's subject statement.\n").optional(),
    "sign_envelope": z.boolean().describe("Determines whether the SAML authentication response message is digitally\nsigned by the IdP or not. A digital signature is required to ensure that\nonly your IdP generated the response message.\n").optional(),
    "sign_assertions": z.boolean().describe("All of the assertions are signed by the IdP.").optional(),
    "signature_algorithm": z.enum(["rsa_sha256", "rsa_sha1", "rsa_sha384", "rsa_sha512"]).describe("The algorithm used for signing the SAML assertions.\n").optional(),
    "digest_algorithm": z.enum(["sha256", "sha1", "sha384", "sha512"]).describe("The algorithm used to encrypt the SAML assertion.\n").optional(),
    "encrypt_assertions": z.boolean().describe("This is the flag that determines if the SAML assertion is encrypted.\nIf this flag is set to `true`, there MUST be a SAML encryption certificate\nuploaded.\n\nDetermines whether the SAML assertion is encr").optional(),
    "assertion_validity_duration_seconds": z.number().describe("The amount of time assertions are valid for in seconds.\n").optional(),
    "assertion_encryption_algorithm": z.enum(["aes256_cbc", "aes256_gcm", "aes128_cbc", "aes128_gcm"]).describe("The algorithm used to encrypt the SAML assertion.").optional(),
    "assertion_key_transport_algorithm": z.enum(["rsa_oaep", "rsa1_5"]).describe("The algorithm used for key transport in SAML assertions.").optional(),
    "assertion_encryption_public_key": z.string().describe("The public key used to encrypt the SAML assertion. This is required\nif `encrypt_assertions` is true.\n").optional(),
    "sp_signature_certificates": z.array(z.array(z.object({
    "sp_public_signing_key": z.string(),
  })).describe("The PEM encoded X509 key certificate of the Service Provider used to verify SAML AuthnRequests.\n")).describe("The PEM encoded X509 key certificate of the Service Provider\nused to verify SAML AuthnRequests.\n").optional(),
    "enable_single_log_out": z.boolean().describe("Enable single logout.").optional(),
    "single_log_out_url": z.string().describe("The location where the logout response will be sent.\nOnly enabled if `enable_single_log_out` is true.\n").optional(),
    "single_log_out_issuer_url": z.string().describe("The issuer ID for the service provider. When handling a Single Log Out.\n\nOnly enabled if `enable_single_log_out` is true.\n").optional(),
    "single_log_out_binding": z.enum(["post", "redirect"]).describe("The binding used for single logout messages.").optional(),
    "single_logout_sign_request_and_response": z.boolean().describe("If we should expect the LogoutRequest to be signed and if we\nshould sign the LogoutResponse.\n").optional(),
    "validate_signed_requests": z.boolean().describe("Select this to validate all SAML requests using the Signature\nCertificate. The payload from the SAML request is validated, and Okta\ndynamically reads any single sign-on (SSO) URLs from the request. Th").optional(),
    "other_sso_urls": z.object({
    "index": z.number().describe("The index that this URL may be referenced by."),
    "url": z.string().describe("This is a URL that may be used to replace the ACS URL.\n"),
  }).describe("For use with SP-initiated sign-in flows. Enter the ACS URLs for any\nother requestable SSO nodes used by your app integration. This option\nenables applications to choose where to send the SAML Response").optional(),
    "additional_user_attributes": z.array(z.enum(["email", "user_name", "external_id", "display_name", "custom_static_string"]).describe("The value of the SAML attribute. It will correspond to a directory attribute of the user.\n")).describe("Any additional attributes to attach to the SAML assertion.").optional(),
    "icon": z.string().describe("The URL or data URI of the icon representing the SSO configuration.").optional(),
    "is_tile_visible": z.boolean().describe("Indicates if the SSO configuration tile is visible to the user.").optional(),
    "inbound_scim": z.record(z.any()).optional(),
    "use_short_url": z.boolean().describe("Changes the EntityID in the SAML response to a shorter version. This is to support applications with URL restrictions.").optional(),
  }), z.object({
    "type": z.enum(["bookmark", "entra_id_external_auth_methods", "generic_oidc", "generic_oidc_idp", "generic_saml", "okta_idp", "okta_sso_bi_idp", "scim", "ws_fed"]).describe("Describes the type of sso config.\n"),
    "client_id": z.string().describe("The client ID for the idp application.").optional(),
    "client_secret": z.string().describe("The client secret to authenticate as the idp application.").optional(),
    "pkce": z.any().optional(),
    "id_token_scopes": z.array(z.string()).optional(),
    "identifying_claim_name": z.string().optional(),
    "identity_attribute": z.enum(["id", "email", "username", "external_id"]).describe("Defines which field should be used to populate the subject field of an id token.\n- `id` - The user ID is used.\n- `email` - The user email is used.\n- `username` - The username is used.\n").optional(),
    "okta_domain": z.string().optional(),
    "inbound_scim": z.record(z.any()).optional(),
  }), z.object({
    "type": z.enum(["bookmark", "entra_id_external_auth_methods", "generic_oidc", "generic_oidc_idp", "generic_saml", "okta_idp", "okta_sso_bi_idp", "scim", "ws_fed"]).describe("Describes the type of sso config.\n"),
    "pkce": z.any().optional(),
    "okta_registration": z.object({
    "domain": z.string().describe("The domain Url inside of Okta.").optional(),
    "okta_token": z.string().describe("An okta token used for accessing the okta API.").optional(),
    "attribute_name": z.string().describe("The name of the attribute within okta that we are going to set to\ntrue.").optional(),
    "is_enabled": z.boolean().describe("If the integration is enabled.").optional(),
  }).describe("Represents a list of Resource Servers as a response body.").optional(),
    "inbound_scim": z.record(z.any()).optional(),
  }), z.object({
    "type": z.enum(["bookmark", "entra_id_external_auth_methods", "generic_oidc", "generic_oidc_idp", "generic_saml", "okta_idp", "okta_sso_bi_idp", "scim", "ws_fed"]).describe("Describes the type of sso config.\n"),
    "company_identifier": z.string().optional(),
  }), z.object({
    "type": z.enum(["bookmark", "entra_id_external_auth_methods", "generic_oidc", "generic_oidc_idp", "generic_saml", "okta_idp", "okta_sso_bi_idp", "scim", "ws_fed"]).describe("Describes the type of sso config.\n"),
    "acs_url": z.string().describe("This is where to redirect too. This is also known as the SP SSO url.\n").optional(),
    "audience_url": z.string().describe("The Recipient/Audience of the RSTR.").optional(),
    "expiration_time_seconds": z.number().describe("The amount of time in seconds that the RSTR should be valid for.").optional(),
    "digest_algorithm": z.enum(["sha256", "sha1", "sha384", "sha512"]).describe("The algorithm used to encrypt the SAML assertion.\n").optional(),
    "signature_algorithm": z.enum(["rsa_sha256", "rsa_sha1", "rsa_sha384", "rsa_sha512"]).describe("The algorithm used for signing the SAML assertions.\n").optional(),
    "name_format": z.enum(["unspecified", "email_address", "x509_subject_name", "persistent", "transient", "entity", "kerberos", "windows_domain_qualified_name"]).describe("Name format of the assertion's subject statement. Processing rules and constraints can be applied based on selection. Default value is \"unspecified\" unless SP explicitly requires differently.\n").optional(),
    "subject_user_name_attribute": z.enum(["user_name", "email", "email_prefix", "external_id", "display_name", "custom", "none"]).describe("Determines the default value for a user's application username. The application username will be used for the assertion's subject statement.\n").optional(),
    "authentication_context": z.enum(["x509", "integrated_windows_federation", "kerberos", "password", "password_protected_transport", "tls_client", "unspecified", "refeds_mfa"]).describe("The SAML Authentication Context Class for the assertion's authentication statement. Default value is \"X509\".\n").optional(),
    "additional_user_attributes": z.array(z.object({
    "name": z.string().describe("The SAML attribute name."),
    "name_format": z.enum(["unspecified", "email_address", "x509_subject_name", "persistent", "transient", "entity", "kerberos", "windows_domain_qualified_name"]).describe("Name format of the assertion's subject statement. Processing rules and constraints can be applied based on selection. Default value is \"unspecified\" unless SP explicitly requires differently.\n"),
    "value": z.enum(["email", "user_name", "external_id", "display_name", "custom_static_string"]).describe("The value to attach to the SAML value."),
    "namespace": z.string().describe("This is an XML namespace that is applied the attribute and all of\nits children.\n").optional(),
  }).describe("This structure describes additional attributes that can be\nattached to SAML assertion inside of WS-Fed token.\n")).describe("Any additional attributes to attach to the assertion.").optional(),
    "icon": z.string().describe("The URL or data URI of the icon representing the SSO configuration.").optional(),
    "is_tile_visible": z.boolean().describe("Indicates if the SSO configuration tile is visible to the user.").optional(),
    "inbound_scim": z.record(z.any()).optional(),
  })]),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "PATCH",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/sso-configs/{sso_config_id}", {
        pathParams: { realm_id: params["realm_id"] as string, sso_config_id: params["sso_config_id"] as string },
        body: { "sso_config": params["sso_config"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "delete_sso_config",
    {
      description: "Permanently delete an SSO configuration. Associated identity and group mappings may become orphaned. This cannot be undone.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "sso_config_id": z.string().describe("A unique identifier of the sso configuration"),
      },
      annotations: { destructiveHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "DELETE",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/sso-configs/{sso_config_id}", {
        pathParams: { realm_id: params["realm_id"] as string, sso_config_id: params["sso_config_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "add_identities_to_sso_config",
    {
      description: "Associate specific identities with an SSO config, granting them access to the SSO application. Requires sso_config_id (use list_sso_configs) and identity_ids (use list_identities).",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "sso_config_id": z.string().describe("A unique identifier of the sso configuration"),
      "identity_ids": z.array(z.string()).describe("IDs of the identities to be added to the sso config."),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/sso-configs/{sso_config_id}:addIdentities", {
        pathParams: { realm_id: params["realm_id"] as string, sso_config_id: params["sso_config_id"] as string },
        body: { "identity_ids": params["identity_ids"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "delete_identities_from_sso_config",
    {
      description: "Remove identity associations from an SSO config, revoking their direct access to the SSO application.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "sso_config_id": z.string().describe("A unique identifier of the sso configuration"),
      "identity_ids": z.array(z.string()).describe("IDs of the identities to be removed from the sso config."),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/sso-configs/{sso_config_id}:deleteIdentities", {
        pathParams: { realm_id: params["realm_id"] as string, sso_config_id: params["sso_config_id"] as string },
        body: { "identity_ids": params["identity_ids"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "list_identities_for_sso_config",
    {
      description: "List all identities associated with an SSO config, both directly (via add_identities_to_sso_config) and indirectly (via group membership from add_groups_to_sso_config).",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "sso_config_id": z.string().describe("A unique identifier of the sso configuration"),
      "page_size": z.number().optional().describe("Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed b"),
      "page_token": z.string().optional().describe("Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/sso-configs/{sso_config_id}:listIdentityAssociations", {
        pathParams: { realm_id: params["realm_id"] as string, sso_config_id: params["sso_config_id"] as string },
        queryParams: { "page_size": params["page_size"] as string | number | boolean | undefined, "page_token": params["page_token"] as string | number | boolean | undefined },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "identity_to_sso_config_check",
    {
      description: "Check whether a specific identity is assigned to a specific SSO config. Requires both identity_id and sso_config_id. Returns a boolean result.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "sso_config_id": z.string().describe("A unique identifier of the sso configuration"),
      "identity_id": z.string().describe("The identity id"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/identities/{identity_id}/sso-configs/{sso_config_id}/is-identity-assigned", {
        pathParams: { realm_id: params["realm_id"] as string, sso_config_id: params["sso_config_id"] as string, identity_id: params["identity_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "list_sso_configs_for_identity",
    {
      description: "List all SSO configs associated with an identity, both directly and through group memberships. Requires identity_id — use list_identities to find identities.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "sso_config_id": z.string().describe("A unique identifier of the sso configuration"),
      "identity_id": z.string().describe("A unique identifier for an identity."),
      "page_size": z.number().optional().describe("Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed b"),
      "page_token": z.string().optional().describe("Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/identities/{identity_id}/sso-configs", {
        pathParams: { realm_id: params["realm_id"] as string, sso_config_id: params["sso_config_id"] as string, identity_id: params["identity_id"] as string },
        queryParams: { "page_size": params["page_size"] as string | number | boolean | undefined, "page_token": params["page_token"] as string | number | boolean | undefined },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "get_flow_type_config",
    {
      description: "Get the flow type configuration for a realm, which controls which authentication flows (e.g. copy, localhost) are enabled. Returns the current enabled/disabled status for each flow type. If no config exists, returns a default.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/flow-type-config", {
        pathParams: { realm_id: params["realm_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "update_flow_type_config",
    {
      description: "Update the flow type configuration for a realm. Controls which authentication flows are available. Changes take effect immediately for new authentication sessions. Rejects unknown fields with 400.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "android": z.object({
    "unknown": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "scheme": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "embedded": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "copy": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "roaming_auth": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "android_autofill": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "android_accessibility": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "pipe": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "localhost": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "universal_link": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "safari_extension": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "layered_auth_qr_code": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "secure_localhost": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
  }).describe("Set of flow type configurations for a platform (update version)").optional(),
      "macos": z.object({
    "unknown": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "scheme": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "embedded": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "copy": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "roaming_auth": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "android_autofill": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "android_accessibility": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "pipe": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "localhost": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "universal_link": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "safari_extension": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "layered_auth_qr_code": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "secure_localhost": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
  }).describe("Set of flow type configurations for a platform (update version)").optional(),
      "ios": z.object({
    "unknown": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "scheme": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "embedded": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "copy": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "roaming_auth": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "android_autofill": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "android_accessibility": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "pipe": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "localhost": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "universal_link": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "safari_extension": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "layered_auth_qr_code": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "secure_localhost": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
  }).describe("Set of flow type configurations for a platform (update version)").optional(),
      "windows": z.object({
    "unknown": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "scheme": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "embedded": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "copy": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "roaming_auth": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "android_autofill": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "android_accessibility": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "pipe": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "localhost": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "universal_link": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "safari_extension": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "layered_auth_qr_code": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "secure_localhost": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
  }).describe("Set of flow type configurations for a platform (update version)").optional(),
      "web": z.object({
    "unknown": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "scheme": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "embedded": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "copy": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "roaming_auth": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "android_autofill": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "android_accessibility": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "pipe": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "localhost": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "universal_link": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "safari_extension": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "layered_auth_qr_code": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "secure_localhost": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
  }).describe("Set of flow type configurations for a platform (update version)").optional(),
      "linux": z.object({
    "unknown": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "scheme": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "embedded": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "copy": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "roaming_auth": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "android_autofill": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "android_accessibility": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "pipe": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "localhost": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "universal_link": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "safari_extension": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "layered_auth_qr_code": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "secure_localhost": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
  }).describe("Set of flow type configurations for a platform (update version)").optional(),
      "chromeos": z.object({
    "unknown": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "scheme": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "embedded": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "copy": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "roaming_auth": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "android_autofill": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "android_accessibility": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "pipe": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "localhost": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "universal_link": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "safari_extension": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "layered_auth_qr_code": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "secure_localhost": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
  }).describe("Set of flow type configurations for a platform (update version)").optional(),
      "chromeosweb": z.object({
    "unknown": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "scheme": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "embedded": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "copy": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "roaming_auth": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "android_autofill": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "android_accessibility": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "pipe": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "localhost": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "universal_link": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "safari_extension": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "layered_auth_qr_code": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
    "secure_localhost": z.object({
    "enabled": z.boolean().describe("Whether the customer allows this flow type to be used.").optional(),
    "valid": z.boolean().describe("Whether the flow type is valid and expected on a given platform").optional(),
  }).describe("Configuration for a specific flow type (update version)").optional(),
  }).describe("Set of flow type configurations for a platform (update version)").optional(),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "PATCH",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/flow-type-config", {
        pathParams: { realm_id: params["realm_id"] as string },
        body: { "android": params["android"], "macos": params["macos"], "ios": params["ios"], "windows": params["windows"], "web": params["web"], "linux": params["linux"], "chromeos": params["chromeos"], "chromeosweb": params["chromeosweb"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "add_groups_to_sso_config",
    {
      description: "Associate groups with an SSO config. All members of the group gain access to the SSO application. Requires sso_config_id and group_ids.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "sso_config_id": z.string().describe("A unique identifier of the sso configuration"),
      "group_ids": z.array(z.string()).describe("IDs of the groups to be added to the sso config."),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/sso-configs/{sso_config_id}:addGroups", {
        pathParams: { realm_id: params["realm_id"] as string, sso_config_id: params["sso_config_id"] as string },
        body: { "group_ids": params["group_ids"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "delete_groups_from_sso_config",
    {
      description: "Remove group associations from an SSO config. Members of the removed groups lose access unless individually associated.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "sso_config_id": z.string().describe("A unique identifier of the sso configuration"),
      "group_ids": z.array(z.string()).describe("IDs of the groups to be removed from the sso config."),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/sso-configs/{sso_config_id}:deleteGroups", {
        pathParams: { realm_id: params["realm_id"] as string, sso_config_id: params["sso_config_id"] as string },
        body: { "group_ids": params["group_ids"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "list_groups_for_sso_config",
    {
      description: "List all groups associated with an SSO config. Requires sso_config_id — use list_sso_configs to discover SSO configs.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "sso_config_id": z.string().describe("A unique identifier of the sso configuration"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/sso-configs/{sso_config_id}:listGroupAssociations", {
        pathParams: { realm_id: params["realm_id"] as string, sso_config_id: params["sso_config_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "list_sso_configs_for_group",
    {
      description: "List all SSO configs associated with a specific group. Requires group_id — use list_groups to discover groups.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "sso_config_id": z.string().describe("A unique identifier of the sso configuration"),
      "group_id": z.string().describe("A unique identifier for a group."),
      "page_size": z.number().optional().describe("Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed b"),
      "page_token": z.string().optional().describe("Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/groups/{group_id}/sso-configs", {
        pathParams: { realm_id: params["realm_id"] as string, sso_config_id: params["sso_config_id"] as string, group_id: params["group_id"] as string },
        queryParams: { "page_size": params["page_size"] as string | number | boolean | undefined, "page_token": params["page_token"] as string | number | boolean | undefined },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "sso_is_group_assigned",
    {
      description: "Check whether specific groups are associated with an SSO config. Provide sso_config_id and group_ids to check.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "sso_config_id": z.string().describe("A unique identifier of the sso configuration"),
      "group_ids": z.array(z.string()).describe("A group id.").optional(),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/sso-configs/{sso_config_id}/is-group-assigned", {
        pathParams: { realm_id: params["realm_id"] as string, sso_config_id: params["sso_config_id"] as string },
        body: { "group_ids": params["group_ids"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "application_id_to_sso_config_id",
    {
      description: "Look up the SSO config ID associated with an application. Requires application_id — use list_applications to find applications. Returns the sso_config_id if one exists.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "application_id": z.string().describe("A unique identifier for an application."),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/applications/{application_id}/sso-configs-id", {
        pathParams: { realm_id: params["realm_id"] as string, application_id: params["application_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "test_sso_config",
    {
      description: "Test an SSO configuration to verify it is correctly set up. Requires sso_config_id. Returns test results indicating whether the config is functional.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "sso_config_id": z.string().describe("A unique identifier of the sso configuration"),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/sso-configs/{sso_config_id}/test", {
        pathParams: { realm_id: params["realm_id"] as string, sso_config_id: params["sso_config_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "list_identity_providers",
    {
      description: "List all identity providers (IdPs) configured in a realm. Currently only OIDC IdP type is supported. Returns objects with protocol configuration including client credentials.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "sso_config_id": z.string().describe("A unique identifier of the sso configuration"),
      "page_size": z.number().optional().describe("Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed b"),
      "page_token": z.string().optional().describe("Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/identity-providers", {
        pathParams: { realm_id: params["realm_id"] as string, sso_config_id: params["sso_config_id"] as string },
        queryParams: { "page_size": params["page_size"] as string | number | boolean | undefined, "page_token": params["page_token"] as string | number | boolean | undefined },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "create_identity_provider",
    {
      description: "Create a new external identity provider for federated authentication. Requires protocol config with type 'oidc_idp', clientId, clientSecret, tokenScopes, jwksUrl, tokenUrl, authorizeUrl, identityAttribute (id/email/username), and identifyingClaimName. PKCE options: disabled, plain, s256.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "display_name": z.string().describe("The human-readable name associated with the identity provider.\n"),
      "protocol_config": z.any(),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/identity-providers", {
        pathParams: { realm_id: params["realm_id"] as string },
        body: { "display_name": params["display_name"], "protocol_config": params["protocol_config"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "get_identity_provider",
    {
      description: "Retrieve a specific identity provider by identity_provider_id. Returns the full protocol config including the clientSecret — handle with care.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "identity_provider_id": z.string().describe("A unique identifier for an identity provider."),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/identity-providers/{identity_provider_id}", {
        pathParams: { realm_id: params["realm_id"] as string, identity_provider_id: params["identity_provider_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "update_identity_provider",
    {
      description: "Update an identity provider's configuration. Changing endpoints or credentials affects active authentication sessions immediately.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "identity_provider_id": z.string().describe("A unique identifier for an identity provider."),
      "identity_provider": z.object({
    "display_name": z.string().describe("The human-readable name associated with the identity provider.\n").optional(),
    "protocol_config": z.any().optional(),
  }).describe("The identity provider object.").optional(),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "PATCH",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/identity-providers/{identity_provider_id}", {
        pathParams: { realm_id: params["realm_id"] as string, identity_provider_id: params["identity_provider_id"] as string },
        body: { "identity_provider": params["identity_provider"] },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "delete_identity_provider",
    {
      description: "Permanently delete an identity provider. Breaks any federated authentication flows using this IdP. Active sessions may be interrupted. This cannot be undone.",
      inputSchema: {
      "realm_id": z.string().describe("A unique identifier for a realm."),
      "identity_provider_id": z.string().describe("A unique identifier for an identity provider."),
      },
      annotations: { destructiveHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "DELETE",
          "/v1/tenants/{tenant_id}/realms/{realm_id}/identity-providers/{identity_provider_id}", {
        pathParams: { realm_id: params["realm_id"] as string, identity_provider_id: params["identity_provider_id"] as string },
      },
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof ApiError
            ? `API Error (${error.statusCode}): ${error.code} - ${error.message}`
            : `Unexpected error: ${String(error)}`;
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    },
  );
}

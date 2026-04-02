// Auto-generated — do not edit manually. Run `npm run generate` to regenerate.
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApiClient } from "../client.js";
import { ApiError } from "../types.js";

export function registerV0Tools(
  server: McpServer,
  apiClient: ApiClient,
): void {

  server.registerTool(
    "list_groups",
    {
      description: "List all groups for the tenant. Returns group objects with pagination (page_size, skip, filter, order_by). Groups are logical collections of users used for access control and organizational purposes.",
      inputSchema: {
      "page_size": z.number().optional().describe("The number of items returned per page. The response may include this exact number or fewer. If omitting this value, the response returns the default number of results the method allows.\n"),
      "skip": z.number().optional().describe("Number of items to skip. This is the zero-based index of the first result.\n"),
      "filter": z.string().optional().describe("Filter query for responses.\n\nThe syntax follows the SCIM grammar from\n[RFC7644 Section 3.4.2.2](https:datatracker.ietf.org/doc/html/rfc7644#section-3.4.2.2).\n\nThe supported operations are:\n  - pr (pre"),
      "order_by": z.string().optional().describe("A comma-delimited list of attributes to sort results.\n\nThe default sorting order per attribute is ascending. Therefore, if you want\ndescending order, append the \" desc\" suffix to the attribute name.\n\n"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v2/groups", {
        queryParams: { "page_size": params["page_size"] as string | number | boolean | undefined, "skip": params["skip"] as string | number | boolean | undefined, "filter": params["filter"] as string | number | boolean | undefined, "order_by": params["order_by"] as string | number | boolean | undefined },
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
      description: "Create a new group. Requires display_name. Optionally include a description. Returns the new group with an auto-generated id. The group starts empty — use add_group_users to add members.",
      inputSchema: {
      "group": z.object({
    "name": z.string().describe("A required unique name for the group within the tenant.\n").optional(),
    "description": z.string().describe("A required description for the group within the tenant.\n").optional(),
  }).describe("A group is a collection of members within an organization that uses Beyond Identity.\n"),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v2/groups", {
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
    "get_groups",
    {
      description: "Retrieve a specific group by group_id. Returns the group object including display_name, description, and timestamps. Use list_groups to discover group_ids.",
      inputSchema: {
      "group_id": z.string().describe("A unique identifier for a group."),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v2/groups/{group_id}", {
        pathParams: { group_id: params["group_id"] as string },
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
      description: "Update attributes of a group (display_name, description). Uses PATCH semantics — omitted fields unchanged. Returns the updated group object.",
      inputSchema: {
      "group_id": z.string().describe("A unique identifier for a group."),
      "group": z.object({
    "name": z.string().describe("A required unique name for the group within the tenant.\n").optional(),
    "description": z.string().describe("A required description for the group within the tenant.\n").optional(),
  }).describe("A group is a collection of members within an organization that uses Beyond Identity.\n"),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "PATCH",
          "/v2/groups/{group_id}", {
        pathParams: { group_id: params["group_id"] as string },
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
      description: "Permanently delete a group. The group must have NO members or the request fails with 409. Remove all members with delete_group_users first. This cannot be undone.",
      inputSchema: {
      "group_id": z.string().describe("A unique identifier for a group."),
      },
      annotations: { destructiveHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "DELETE",
          "/v2/groups/{group_id}", {
        pathParams: { group_id: params["group_id"] as string },
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
    "list_group_users",
    {
      description: "List all users that are members of a group. Returns full user objects with pagination. Requires group_id — use list_groups to discover groups.",
      inputSchema: {
      "group_id": z.string().describe("A unique identifier for a group."),
      "page_size": z.number().optional().describe("The number of items returned per page. The response may include this exact number or fewer. If omitting this value, the response returns the default number of results the method allows.\n"),
      "skip": z.number().optional().describe("Number of items to skip. This is the zero-based index of the first result.\n"),
      "filter": z.string().optional().describe("Filter query for responses.\n\nThe syntax follows the SCIM grammar from\n[RFC7644 Section 3.4.2.2](https:datatracker.ietf.org/doc/html/rfc7644#section-3.4.2.2).\n\nThe supported operations are:\n  - pr (pre"),
      "order_by": z.string().optional().describe("A comma-delimited list of attributes to sort results.\n\nThe default sorting order per attribute is ascending. Therefore, if you want\ndescending order, append the \" desc\" suffix to the attribute name.\n\n"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v2/groups/{group_id}:listUsers", {
        pathParams: { group_id: params["group_id"] as string },
        queryParams: { "page_size": params["page_size"] as string | number | boolean | undefined, "skip": params["skip"] as string | number | boolean | undefined, "filter": params["filter"] as string | number | boolean | undefined, "order_by": params["order_by"] as string | number | boolean | undefined },
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
    "add_group_users",
    {
      description: "Add 1–1000 users to a group. Provide an array of user IDs. Requires the group to exist (use list_groups or create_group first). All-or-nothing: if any user ID is invalid, the entire operation fails.",
      inputSchema: {
      "group_id": z.string().describe("A unique identifier for a group."),
      "id": z.string().describe("ID of the group.").optional(),
      "user_ids": z.array(z.string()).describe("IDs of the users to be added to the group.").optional(),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v2/groups/{group_id}:addUsers", {
        pathParams: { group_id: params["group_id"] as string },
        body: { "id": params["id"], "user_ids": params["user_ids"] },
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
    "delete_group_users",
    {
      description: "Remove 1–1000 users from a group. Provide an array of user IDs. All-or-nothing: if any user ID is invalid, the entire operation fails.",
      inputSchema: {
      "group_id": z.string().describe("A unique identifier for a group."),
      "id": z.string().describe("ID of the group.").optional(),
      "user_ids": z.array(z.string()).describe("IDs of the users to be deleted from the group.").optional(),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v2/groups/{group_id}:deleteUsers", {
        pathParams: { group_id: params["group_id"] as string },
        body: { "id": params["id"], "user_ids": params["user_ids"] },
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
    "list_users",
    {
      description: "List all users for the tenant. Returns user objects with pagination (page_size, skip, filter, order_by). Supports filtering by email, username, and other attributes.",
      inputSchema: {
      "page_size": z.number().optional().describe("The number of items returned per page. The response may include this exact number or fewer. If omitting this value, the response returns the default number of results the method allows.\n"),
      "skip": z.number().optional().describe("Number of items to skip. This is the zero-based index of the first result.\n"),
      "filter": z.string().optional().describe("Filter query for responses.\n\nThe syntax follows the SCIM grammar from\n[RFC7644 Section 3.4.2.2](https:datatracker.ietf.org/doc/html/rfc7644#section-3.4.2.2).\n\nThe supported operations are:\n  - pr (pre"),
      "order_by": z.string().optional().describe("A comma-delimited list of attributes to sort results.\n\nThe default sorting order per attribute is ascending. Therefore, if you want\ndescending order, append the \" desc\" suffix to the attribute name.\n\n"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v2/users", {
        queryParams: { "page_size": params["page_size"] as string | number | boolean | undefined, "skip": params["skip"] as string | number | boolean | undefined, "filter": params["filter"] as string | number | boolean | undefined, "order_by": params["order_by"] as string | number | boolean | undefined },
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
    "create_user",
    {
      description: "Create a new user. Requires email, user_name, and display_name. Both email and username must be unique within the tenant (409 if duplicate). Returns the new user with an auto-generated id.",
      inputSchema: {
      "user": z.object({
    "external_id": z.string().describe("A required unique identifier for the user within the tenant.\n").optional(),
    "email_address": z.string().describe("A required email address serving as primary contact for user.\n").optional(),
    "username": z.string().describe("A required username for the user.").optional(),
    "display_name": z.string().describe("A required human-readable name for the user that is used for display purposes.\n").optional(),
  }).describe("A user is a member of an organization that uses Beyond Identity.\n"),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v2/users", {
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
    "get_user",
    {
      description: "Retrieve a specific user by user_id. Returns the full user object including email, username, display_name, status, and timestamps. Use list_users to discover user_ids.",
      inputSchema: {
      "user_id": z.string().describe("A unique identifier for a user."),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v2/users/{user_id}", {
        pathParams: { user_id: params["user_id"] as string },
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
    "update_user",
    {
      description: "Update attributes of a user. Uses PATCH semantics — omitted fields unchanged. Returns 409 if updated email or username conflicts with an existing user.",
      inputSchema: {
      "user_id": z.string().describe("A unique identifier for a user."),
      "user": z.object({
    "external_id": z.string().describe("A required unique identifier for the user within the tenant.\n").optional(),
    "email_address": z.string().describe("A required email address serving as primary contact for user.\n").optional(),
    "username": z.string().describe("A required username for the user.").optional(),
    "display_name": z.string().describe("A required human-readable name for the user that is used for display purposes.\n").optional(),
  }).describe("A user is a member of an organization that uses Beyond Identity.\n"),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "PATCH",
          "/v2/users/{user_id}", {
        pathParams: { user_id: params["user_id"] as string },
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
    "delete_user",
    {
      description: "Permanently delete a user. Removes the user from all group memberships. This cannot be undone.",
      inputSchema: {
      "user_id": z.string().describe("A unique identifier for a user."),
      },
      annotations: { destructiveHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "DELETE",
          "/v2/users/{user_id}", {
        pathParams: { user_id: params["user_id"] as string },
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
    "list_user_groups",
    {
      description: "List all groups a user belongs to. Returns full group objects with pagination. Requires user_id — use list_users to find users.",
      inputSchema: {
      "user_id": z.string().describe("A unique identifier for a user."),
      "page_size": z.number().optional().describe("The number of items returned per page. The response may include this exact number or fewer. If omitting this value, the response returns the default number of results the method allows.\n"),
      "skip": z.number().optional().describe("Number of items to skip. This is the zero-based index of the first result.\n"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v2/users/{user_id}/groups", {
        pathParams: { user_id: params["user_id"] as string },
        queryParams: { "page_size": params["page_size"] as string | number | boolean | undefined, "skip": params["skip"] as string | number | boolean | undefined },
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
    "create_binding_job",
    {
      description: "Create a credential binding job to provision a new passkey for a user. Specify the user_id and delivery method. The binding link is sent to the user or returned directly depending on the delivery method. Use list_users to find the user_id first.",
      inputSchema: {
      "binding_job": z.object({
    "user_id": z.string().describe("ID of the user to which the credential should be bound.\n").optional(),
    "issuer_user_id": z.string().describe("ID of the user \"issuing\" (creating) this binding job. May be the same as `user_id`, if this binding job was created as part of a self-service flow.\n").optional(),
    "delivery_method": z.string().describe("Method by which the binding job is to be delivered to the end user. The only supported method is `SHORT_CODE`. New methods may be added later. This field is immutable and read-only.\n").optional(),
    "short_code_delivery_details": z.object({
    "expire_time": z.string().describe("A time value in the ISO8601 combined date and time format that represents the time the short code will expire. This field is immutable. The expire time is at most 15 minutes from the creation time of ").optional(),
  }).describe("Details about the short code. Only present if `delivery_method` is `SHORT_CODE`.\n").optional(),
  }).describe("A binding job tracks the process of binding a new credential for a user.\n"),
      "ttl_seconds": z.number().describe("Number of seconds until the binding job expires. This must be between 1 minute (60 seconds) and 15 minutes (900 seconds). This field is used only if the `expire_time` on the requested binding job is u").optional(),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/v2/binding-jobs", {
        body: { "binding_job": params["binding_job"], "ttl_seconds": params["ttl_seconds"] },
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
    "get_binding_job",
    {
      description: "Retrieve the status of a credential binding job by binding_job_id. Shows the current state of the passkey provisioning process (e.g. link sent, completed, expired, failed).",
      inputSchema: {
      "binding_job_id": z.string().describe("The binding job id"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v2/binding-jobs/{binding_job_id}", {
        pathParams: { binding_job_id: params["binding_job_id"] as string },
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
    "list_passkeys",
    {
      description: "List all passkeys across the tenant. Returns passkey objects with state, type, and associated user info. Supports pagination and filtering. Passkeys are the cryptographic credentials users use to authenticate.",
      inputSchema: {
      "page_size": z.number().optional().describe("The number of items returned per page. The response may include this exact number or fewer. If omitting this value, the response returns the default number of results the method allows.\n"),
      "skip": z.number().optional().describe("Number of items to skip. This is the zero-based index of the first result.\n"),
      "filter": z.string().optional().describe("Filter query for responses.\n\nThe syntax follows the SCIM grammar from\n[RFC7644 Section 3.4.2.2](https:datatracker.ietf.org/doc/html/rfc7644#section-3.4.2.2).\n\nThe supported operations are:\n  - pr (pre"),
      "order_by": z.string().optional().describe("A comma-delimited list of attributes to sort results.\n\nThe default sorting order per attribute is ascending. Therefore, if you want\ndescending order, append the \" desc\" suffix to the attribute name.\n\n"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v2/passkeys", {
        queryParams: { "page_size": params["page_size"] as string | number | boolean | undefined, "skip": params["skip"] as string | number | boolean | undefined, "filter": params["filter"] as string | number | boolean | undefined, "order_by": params["order_by"] as string | number | boolean | undefined },
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
    "delete_passkey",
    {
      description: "Permanently delete a passkey by passkey_id. The user will no longer be able to authenticate with this passkey. This cannot be undone. Use list_passkeys to find passkey_ids.",
      inputSchema: {
      "passkey_id": z.string().describe("A unique identifier for a passkey."),
      },
      annotations: { destructiveHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "DELETE",
          "/v2/passkeys/{passkey_id}", {
        pathParams: { passkey_id: params["passkey_id"] as string },
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
    "list_passkey_tags",
    {
      description: "List all tags associated with a passkey. Tags are key-value metadata attached to passkeys for organizational purposes. Requires passkey_id — use list_passkeys to discover passkeys.",
      inputSchema: {
      "passkey_id": z.string().describe("A unique identifier for a passkey."),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/v2/passkeys/{passkey_id}/tags", {
        pathParams: { passkey_id: params["passkey_id"] as string },
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
    "set_passkey_tags",
    {
      description: "Set tags on a passkey, replacing all existing tags. Tags are key-value metadata. Uses PUT semantics — provide the complete set of desired tags; any existing tags not included will be removed.",
      inputSchema: {
      "passkey_id": z.string().describe("A unique identifier for a passkey."),
      "tags": z.array(z.object({
    "name": z.string().describe("Name of the tag. Case-insensitive.\n"),
  })).describe("List of tags to set on the passkey. Tags are identified by name, which is case-insensitive and unique per tenant. Tags are created automatically if they do not already exist.\n"),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "PUT",
          "/v2/passkeys/{passkey_id}/tags", {
        pathParams: { passkey_id: params["passkey_id"] as string },
        body: { "tags": params["tags"] },
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
      description: "List users via the SCIM v2.0 protocol. Supports SCIM filtering syntax and pagination (startIndex, count). Max 1000 results per page. Returns SCIM User resources with standard and extension attributes.",
      inputSchema: {
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
          "/scim/v2/Users", {
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
      description: "Create a user via SCIM. Requires externalId, userName, displayName, active, name (givenName, familyName), and emails (at least one primary). On conflict (duplicate externalId/userName), the existing user is reactivated instead of failing.",
      inputSchema: {
      "schemas": z.array(z.string()).describe("The list of schemas used to define the user. This must contain only the core User schema (\"urn:ietf:params:scim:schemas:core:2.0:User\").\n"),
      "externalId": z.string().describe("The provisioning client's unique identifier for the resource. This value must be unique across all users.\n"),
      "userName": z.string().describe("The unique username of the user. The value of this field will be returned as the subject of an OIDC ID Token.\n"),
      "displayName": z.string().describe("Display name of the User. This name is used for display purposes.\n"),
      "active": z.boolean().describe("Indicator for the user's administrative status. If true, the user has administrative capabilities.\n"),
      "emails": z.array(z.object({
    "primary": z.boolean().describe("Indicator for the primary email address. Important notes about email handling: - Only one email address is supported per user - The email must be marked as primary (primary: true) - If multiple email ").optional(),
    "value": z.string().describe("The email address. Important notes about email handling: - Only one email address is supported per user - The email must be marked as primary (primary: true) - If multiple email addresses are provided").optional(),
    "type": z.enum(["work", "home", "other"]).describe("The type of email address. Valid values are \"work\", \"home\", and \"other\" as defined in [RFC 7643](https://www.rfc-editor.org/rfc/rfc7643).\nImportant notes about email handling: - Only one email address").optional(),
  }).describe("Email addresses for the user. Important notes about email handling: - Only one email address is supported per user - The email must be marked as primary (primary: true) - If multiple email addresses a")).describe("The list containing the user's emails. Important notes about email handling: - Only one email address is supported per user - The email must be marked as primary (primary: true) - If multiple email ad"),
      "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User": z.object({
    "employeeNumber": z.string().describe("The identifier assigned to a user within the enterprise, often a numerical or alphanumeric code.\n").optional(),
  }).describe("A string identifier, typically numeric or alphanumeric, assigned to a person, typically based on order of hire or association as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#sec").optional(),
      "name": z.object({
    "givenName": z.string().describe("The given name of the user, or first name in most Western languages.\n").optional(),
    "familyName": z.string().describe("The family name of the user, or last name in most Western languages.\n").optional(),
  }).describe("Definition of the user's name.").optional(),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/scim/v2/Users", {
        body: { "schemas": params["schemas"], "externalId": params["externalId"], "userName": params["userName"], "displayName": params["displayName"], "active": params["active"], "emails": params["emails"], "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User": params["urn:ietf:params:scim:schemas:extension:enterprise:2.0:User"], "name": params["name"] },
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
      "user_id": z.string().describe("ID of the user."),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/scim/v2/Users/{user_id}", {
        pathParams: { user_id: params["user_id"] as string },
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
      "user_id": z.string().describe("ID of the user."),
      "user": z.object({
    "schemas": z.array(z.string()).describe("The list of schemas used to define the user. This must contain only the core User schema (\"urn:ietf:params:scim:schemas:core:2.0:User\").\n"),
    "externalId": z.string().describe("The provisioning client's unique identifier for the resource. This value must be unique across all users.\n").optional(),
    "userName": z.string().describe("The unique username of the user. The value of this field will be returned as the subject of an OIDC ID Token.\n").optional(),
    "displayName": z.string().describe("Display name of the User. This name is used for display purposes.\n").optional(),
    "active": z.boolean().describe("Indicator for the user's administrative status. If true, the user has administrative capabilities.\n").optional(),
    "emails": z.array(z.object({
    "primary": z.boolean().describe("Indicator for the primary email address. Important notes about email handling: - Only one email address is supported per user - The email must be marked as primary (primary: true) - If multiple email ").optional(),
    "value": z.string().describe("The email address. Important notes about email handling: - Only one email address is supported per user - The email must be marked as primary (primary: true) - If multiple email addresses are provided").optional(),
    "type": z.enum(["work", "home", "other"]).describe("The type of email address. Valid values are \"work\", \"home\", and \"other\" as defined in [RFC 7643](https://www.rfc-editor.org/rfc/rfc7643).\nImportant notes about email handling: - Only one email address").optional(),
  }).describe("Email addresses for the user. Important notes about email handling: - Only one email address is supported per user - The email must be marked as primary (primary: true) - If multiple email addresses a")).describe("The list containing the user's emails. Important notes about email handling: - Only one email address is supported per user - The email must be marked as primary (primary: true) - If multiple email ad").optional(),
    "name": z.object({
    "givenName": z.string().describe("The given name of the user, or first name in most Western languages.\n").optional(),
    "familyName": z.string().describe("The family name of the user, or last name in most Western languages.\n").optional(),
  }).describe("Definition of the user's name.").optional(),
    "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User": z.object({
    "employeeNumber": z.string().describe("A string identifier, typically numeric or alphanumeric, assigned to a person, typically based on order of hire or association with an organization as defined in [RFC 7643](https://datatracker.ietf.org").optional(),
  }).describe("The Employee Number as defined in the enterprise SCIM extension").optional(),
    "meta": z.object({
    "resourceType": z.string().describe("The name of the resource type of the resource."),
  }).describe("Resource metadata as defined in [RFC 7643 Section 3.1](https://www.rfc-editor.org/rfc/rfc7643#section-3.1). This attribute is only populated on responses and is ignored on requests.\n").optional(),
  }).describe("A user represents a human entity as defined by\n[RFC 7643 Section 4.1](https://www.rfc-editor.org/rfc/rfc7643#section-4.1).\n\nThe externalId attribute must be unique across all users in the system.\n"),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "PUT",
          "/scim/v2/Users/{user_id}", {
        pathParams: { user_id: params["user_id"] as string },
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
      "user_id": z.string().describe("ID of the user."),
      "schemas": z.array(z.string()),
      "Operations": z.array(z.object({
    "op": z.enum(["add", "replace"]).describe("The operation to be performed. The operation follows the SCIM specification for PATCH operations. Please refer to the [SCIM specification](https://datatracker.ietf.org/doc/html/rfc7644#section-3.5.2) "),
    "path": z.string().describe("The path to the attribute to be updated. The path follows the SCIM specification for PATCH operations. Please refer to the [SCIM specification](https://datatracker.ietf.org/doc/html/rfc7644#section-3.").optional(),
    "value": z.record(z.any()).describe("The value to be updated. The structure of the value is dependent on the path. Please refer to the examples for proper request formatting.\nFor example, the value for the path \"emails\" must be an array "),
  })),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "PATCH",
          "/scim/v2/Users/{user_id}", {
        pathParams: { user_id: params["user_id"] as string },
        body: { "schemas": params["schemas"], "Operations": params["Operations"] },
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
      description: "Delete a SCIM user. Removes the user from all groups. May be soft or hard delete depending on configuration.",
      inputSchema: {
      "user_id": z.string().describe("ID of the user."),
      },
      annotations: { destructiveHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "DELETE",
          "/scim/v2/Users/{user_id}", {
        pathParams: { user_id: params["user_id"] as string },
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
      description: "List groups via the SCIM v2.0 protocol. Returns Group resources with displayName, externalId, members array, and Beyond Identity extensions. Permission groups cannot be created or modified via SCIM.",
      inputSchema: {
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
          "/scim/v2/Groups", {
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
      description: "Create a group via SCIM. Requires displayName. Cannot use reserved permission group names. Optionally include members and description. All member IDs must reference existing users.",
      inputSchema: {
      "schemas": z.array(z.string()).describe("The list of schemas used to define the group. This must contain the core Group schema (\"urn:ietf:params:scim:schemas:core:2.0:Group\") and may include the custom Beyond Identity Group schema extension "),
      "displayName": z.string().describe("The unique display name of the group. This name is used for display purposes.\n"),
      "members": z.array(z.object({
    "display": z.string().describe("The display name of the group member, primarily used for display purposes.\n").optional(),
    "value": z.string().describe("ID of the user resource corresponding to the group member. This field is immutable.\n").optional(),
    "$ref": z.string().describe("The URI to another user resource that is a member of the group. This is field is only used for requests and is not returned on the response.\n").optional(),
    "type": z.string().describe("The resource type of the group member. Currently, only users are\nsupported as group members. This field is only used for requests\nand is not returned on the response.\n\nSpecifying a group as a group me").optional(),
  }).describe("Definition of a group member.\n\nThe Beyond Identity SCIM server only supports users as group members.\n")).describe("The list of the group's members. Please note that only users can be added as members. If a non-existing user is specified, the endpoint will return a 404 error.").optional(),
      "urn:scim:schemas:extension:byndid:1.0:Group": z.object({
    "description": z.string().describe("Description of the group.").optional(),
  }).describe("The Beyond Identity Group schema extension.").optional(),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "POST",
          "/scim/v2/Groups", {
        body: { "schemas": params["schemas"], "displayName": params["displayName"], "members": params["members"], "urn:scim:schemas:extension:byndid:1.0:Group": params["urn:scim:schemas:extension:byndid:1.0:Group"] },
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
      },
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/scim/v2/Groups/{group_id}", {
        pathParams: { group_id: params["group_id"] as string },
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
      description: "Partially update a SCIM group via PATCH operations. Supports adding/removing members subject to a max batch size limit.",
      inputSchema: {
      "group_id": z.string().describe("ID of the group."),
      "schemas": z.array(z.string()),
      "Operations": z.array(z.object({
    "op": z.enum(["add", "remove", "replace"]),
    "path": z.string().optional(),
    "value": z.record(z.any()).describe("The value to be updated. The structure of the value is dependent on the path. Please refer to the examples for proper request formatting.\nFor example, the value for the path \"members\" must be an array"),
  })),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "PATCH",
          "/scim/v2/Groups/{group_id}", {
        pathParams: { group_id: params["group_id"] as string },
        body: { "schemas": params["schemas"], "Operations": params["Operations"] },
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
      },
      annotations: { destructiveHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "DELETE",
          "/scim/v2/Groups/{group_id}", {
        pathParams: { group_id: params["group_id"] as string },
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
      description: "List SCIM resource types supported by this server (User and Group). Returns metadata describing schemas, endpoints, and supported operations. This is a fixed server-capability endpoint.",
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/scim/v2/ResourceTypes",
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
      description: "List all SCIM schemas supported by this server, including core schemas and Beyond Identity extensions. This is a fixed server-capability endpoint.",
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/scim/v2/Schemas",
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
      description: "Get the SCIM service provider configuration describing server capabilities: authentication, filtering, patch support, and max results (1000). This is a fixed server-capability endpoint.",
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "GET",
          "/scim/v2/ServiceProviderConfig",
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
    "retire_tenant_issuer",
    {
      description: "Retire the intermediate tenant certificate used for device credential signing. This is a sensitive operation — once retired, the old certificate can no longer issue new credentials. Existing credentials signed by the old certificate remain valid until they expire.",
      inputSchema: {
      body: z.record(z.any()).describe("An empty object body"),
      },
    },
    async (params: Record<string, unknown>) => {
      try {
        const result = await apiClient.request(
          "PATCH",
          "/v2/CertificateAuthority/RetireTenantIssuer", {
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
}

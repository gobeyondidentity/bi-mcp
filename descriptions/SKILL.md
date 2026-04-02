# Writing Tool Descriptions

## Goal

Write descriptions that help AI agents understand what each tool does, what prerequisites it has, and how it relates to other tools. A good description answers:

- What does this tool do?
- What do I need before I can call it? (e.g. "requires a group_id — use list_groups first")
- What does the response contain?
- Any gotchas or important context?

## Where to find the services

The Beyond Identity platform services live at `$ZEROPW/`. Inspect the relevant service code to understand what each endpoint actually does, what validations it performs, and what side effects it has. This will help you write descriptions that go beyond the OpenAPI summary.

## Format

- Write descriptions as plain strings in `v1.json` or `v0.json`, keyed by tool name
- Keep descriptions under 500 characters — concise but complete
- Mention prerequisite tools by name (e.g. "use list_groups to get a group_id")
- Mention what the response includes when it's not obvious

## Example

```json
{
  "add_group_members": "Add one or more identities as members of an existing group. Requires a group_id (use list_groups or create_group first) and an array of identity_ids (use list_identities to find them). Members added to a group inherit any roles assigned to that group."
}
```

## Workflow

1. Pick a tool from `v1.json` or `v0.json` that has no entry yet, is weak, or is specified by the user
2. Find the corresponding service handler in `$ZEROPW/` by searching for the operation name or URL path
3. Read the handler to understand validations, side effects, and relationships
4. Write a description and add it to the JSON file
5. Run `npm run generate` to apply the override
6. Run `npm run build` to verify everything compiles

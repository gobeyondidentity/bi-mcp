// Anthropic's tool input_schema validator requires every top-level property
// key to match this pattern. SCIM URN keys (and a few like `$ref`) don't, so
// the generator exposes a sanitized alias to the agent and remaps back to the
// original key at request time. See applyRemap in src/remap.ts.
export const KEY_PATTERN = /^[a-zA-Z0-9_.-]{1,64}$/;

// Collision behavior: two distinct keys can sanitize to the same safe key
// (any pair sharing their first 64 chars after replacement). sanitizeKey itself
// does not detect this — it's stateless and single-call. The generator
// (scripts/generate.ts) tracks safe→original mappings in a per-tool Map and
// throws a "Sanitization collision" error if a second original tries to claim
// the same safe key. The intent is loud failure: a colliding URN is rare and
// the human running `npm run generate` should look at the spec rather than
// have a hash suffix silently shipped to agents and the API.
export function sanitizeKey(key: string): string {
  if (KEY_PATTERN.test(key)) return key;
  return key.replace(/[^a-zA-Z0-9_.-]/g, "_").slice(0, 64);
}

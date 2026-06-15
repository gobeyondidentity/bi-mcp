// Anthropic's tool input_schema validator requires every top-level property
// key to match this pattern. SCIM URN keys (and a few like `$ref`) don't, so
// the generator exposes a sanitized alias to the agent and remaps back to the
// original key at request time. See applyRemap in src/remap.ts.
export const KEY_PATTERN = /^[a-zA-Z0-9_.-]{1,64}$/;

export function sanitizeKey(key: string): string {
  if (KEY_PATTERN.test(key)) return key;
  return key.replace(/[^a-zA-Z0-9_.-]/g, "_").slice(0, 64);
}

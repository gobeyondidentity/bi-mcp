export function applyRemap<T>(value: T, remap: Record<string, string>): T {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) {
    return value.map((v) => applyRemap(v, remap)) as unknown as T;
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    const newKey = remap[k] ?? k;
    out[newKey] = applyRemap(v, remap);
  }
  return out as unknown as T;
}

// Apply known local workarounds to the downloaded OpenAPI specs before code
// generation. Patches are declared in scripts/spec-patches.ts. Idempotent:
// re-running after a successful patch is a no-op; if a patch's `apply` runs
// without producing the expected state, the runner throws.

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseDocument } from "yaml";
import { SPEC_PATCHES, type SpecPatch } from "./spec-patches.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const SPEC_PATHS = {
  v1: resolve(ROOT, "openapi.yaml"),
  v0: resolve(ROOT, "openapi-v0.yaml"),
} as const;

function applyPatchesForSpec(specName: "v1" | "v0"): void {
  const patches = SPEC_PATCHES.filter((p) => p.spec === specName);
  if (patches.length === 0) return;

  const path = SPEC_PATHS[specName];
  const raw = readFileSync(path, "utf-8");
  const doc = parseDocument(raw);

  let applied = 0;
  let skipped = 0;

  for (const patch of patches) {
    if (patch.alreadyApplied(doc)) {
      skipped++;
      continue;
    }
    try {
      patch.apply(doc);
    } catch (err) {
      throw new Error(
        `Patch failed for ${specName}: ${patch.description}\n  ${(err as Error).message}`,
      );
    }
    if (!patch.alreadyApplied(doc)) {
      throw new Error(
        `Patch did not produce expected state for ${specName}: ${patch.description}`,
      );
    }
    applied++;
  }

  if (applied === 0 && skipped === patches.length) {
    console.log(`  ${specName}: all ${skipped} patch(es) already applied`);
    return;
  }
  writeFileSync(path, doc.toString());
  console.log(`  ${specName}: applied ${applied}, skipped ${skipped} (already applied)`);
}

function main(): void {
  console.log(`Applying ${SPEC_PATCHES.length} spec patch(es)...`);
  applyPatchesForSpec("v1");
  applyPatchesForSpec("v0");
}

main();

// Re-export for type-checks
export { SPEC_PATCHES, type SpecPatch };

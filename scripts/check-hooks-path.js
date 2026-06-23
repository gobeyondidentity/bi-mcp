#!/usr/bin/env node
// Validates that husky's prepare step set `core.hooksPath` correctly,
// and auto-corrects if not.
//
// Some npm + husky combinations have been observed writing a corrupted
// value (e.g. "--version/_") to `core.hooksPath` during `prepare`. The
// symptom is that `git commit` fails with a cryptic `sh: ...: invalid
// option` error that has zero connection to husky in the message — a
// fresh contributor would burn an hour debugging it.
//
// This script runs as part of `prepare` (after `husky`) and:
//   1. Exits silently if we're not in a git checkout, or if `.husky/`
//      doesn't exist (e.g. this package was installed as a dependency
//      and the source `.husky/` is not present).
//   2. Auto-corrects a wrong hooksPath value and prints a loud warning
//      so the regression is still visible.
//   3. Passes silently when the value is correct.
//
// Auto-correct rationale: simply failing the install creates an infinite
// loop — re-running `npm install` re-triggers `prepare` which re-writes
// the bad value. The warning preserves visibility while keeping `npm
// install` usable.

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

const EXPECTED = ".husky/_";

function inGitCheckout() {
  try {
    execSync("git rev-parse --git-dir", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function readHooksPath() {
  try {
    return execSync("git config --get core.hooksPath", {
      encoding: "utf-8",
    }).trim();
  } catch {
    // `git config --get` exits 1 when the key is unset.
    return "";
  }
}

if (!inGitCheckout() || !existsSync(".husky")) {
  process.exit(0);
}

const current = readHooksPath();

if (current === EXPECTED) {
  process.exit(0);
}

// Wrong value (or unset) — auto-correct loudly. The warning is on stderr
// so it doesn't pollute scripted stdout pipelines.
process.stderr.write("\n");
process.stderr.write(
  "─────────────────────────────────────────────────────────────────\n",
);
process.stderr.write(
  `[hooks-path] husky prepare set core.hooksPath to "${current || "(unset)"}"\n`,
);
process.stderr.write(`[hooks-path] expected "${EXPECTED}" — auto-correcting.\n`);
process.stderr.write(
  "[hooks-path] If this warning persists across installs, file an issue —\n",
);
process.stderr.write(
  "[hooks-path] something in the npm/husky interaction is leaking an arg.\n",
);
process.stderr.write(
  "─────────────────────────────────────────────────────────────────\n",
);
process.stderr.write("\n");

execSync(`git config --local core.hooksPath ${EXPECTED}`);

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

// The expected `core.hooksPath` value after `husky` (v9.x) finishes its
// `prepare` step. Husky writes this to the LOCAL git config and stores
// its hook stubs under `.husky/_/`. If husky ever changes its install
// layout (major version bump), this constant must change too — otherwise
// this check will fight husky every install. See husky's `prepare` impl:
//   https://github.com/typicode/husky
// Coupled to husky `~9.x`; package.json pins the major via `^9.0.0`.
const EXPECTED = ".husky/_";

function inGitCheckout() {
  try {
    execSync("git rev-parse --git-dir", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function readLocalHooksPath() {
  // `--local` restricts to repo-local config — we want to know what
  // husky's prepare actually wrote, not whatever the user has in their
  // global/system config. If a contributor has a global core.hooksPath
  // set (some folks do), reading without --local would point the finger
  // at husky inaccurately.
  try {
    return execSync("git config --local --get core.hooksPath", {
      encoding: "utf-8",
    }).trim();
  } catch {
    // Exits 1 when the key isn't set locally.
    return "";
  }
}

if (!inGitCheckout() || !existsSync(".husky")) {
  process.exit(0);
}

const current = readLocalHooksPath();

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

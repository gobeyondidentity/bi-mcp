// Flat config — eslint v9+. Surface obvious bugs (unused vars, no console.log
// in src, no-var) without being noisy about style choices that prettier would
// handle.

import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "src/generated/**",
      "scripts/exercise/reports/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Node-runtime JS scripts (.js files we ship & run via `node`) need
    // the Node globals declared so `no-undef` doesn't trip on `process`.
    // TS files don't need this — the tseslint parser handles them.
    files: ["**/*.js"],
    languageOptions: {
      globals: { process: "readonly", Buffer: "readonly" },
    },
  },
  {
    files: ["**/*.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Forbidden in linted code. Generated code (src/generated/**) is
      // excluded via the top-level `ignores`, so the existing zod-wrapped
      // any-casts there don't trip this. Intentional casts elsewhere
      // require an explicit `// eslint-disable-next-line` with a
      // justification comment. The previous `"warn"` setting was
      // self-defeating under `--max-warnings 0` (CI + lint-staged).
      "@typescript-eslint/no-explicit-any": "error",
      // We allow non-null assertions only where context proves safety
      // (post-skip predicates in exercise scenarios mostly).
      "@typescript-eslint/no-non-null-assertion": "off",
      // Banned in src/ — must use console.error (or the structured logger in
      // Tier 2). Scripts and tests can console.log freely.
      "no-console": "off",
    },
  },
  {
    files: ["src/**/*.ts"],
    rules: {
      "no-console": ["error", { allow: ["error"] }],
    },
  },
];

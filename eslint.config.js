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
    files: ["**/*.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // The codebase uses `unknown` rigorously, but generated/zod-wrapped code
      // legitimately needs `any` casts in places. Warn rather than error.
      "@typescript-eslint/no-explicit-any": "warn",
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

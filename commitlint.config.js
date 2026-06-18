// Conventional Commits validation — keeps commit messages in a shape that
// `conventional-changelog` (Tier 2) can parse to auto-generate CHANGELOG.md.
// Accepted prefixes: feat, fix, chore, docs, style, refactor, perf, test,
// build, ci, revert. Append `!` or a `BREAKING CHANGE:` footer for breaking.
//
// Examples:
//   feat: add cross-tenant exercise mode
//   fix(client): honor Retry-After on 429 with HTTP-date form
//   chore(deps): bump typescript-eslint to 8.61.1
export default { extends: ["@commitlint/config-conventional"] };

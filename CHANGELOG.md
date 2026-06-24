# Changelog

All notable changes to `@beyondidentity/mcp` are documented here. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - YYYY-MM-DD

### Added

- `ApiClient` per-attempt timeout via `AbortController`. Default 30s,
  override with `BI_HTTP_TIMEOUT_MS` env var. Covers fetch + body parsing
  end-to-end, not just the headers wait.
- Retry with exponential backoff + ±20% jitter on 5xx-except-501, network
  errors, and 429. Honors `Retry-After` (capped at 60s by default;
  configurable via `ApiClientOptions.maxRetryAfterMs` — server requests
  above the cap surface the error instead of parking the process).
- `User-Agent: beyond-identity-mcp/<version>` header on every request,
  letting Beyond Identity telemetry distinguish MCP-driven traffic.
- `retryNonIdempotent` opt-in flag on `RequestOptions` for POST/PATCH
  endpoints the caller knows are safe to repeat.
- New optional `ApiClientOptions` constructor argument for injectable
  retry/timeout/sleep configuration. Existing single-argument callers
  continue to work unchanged.
- 60-second clock-skew tolerance on the startup JWT expiry check, so a
  token expiring within seconds doesn't fail boot.
- Tenant-isolation guard tests at the client + generator layers (no v1
  tool exposes `tenant_id` as an agent-visible input; client overwrites
  path-param tenant_id spoofs with the JWT-derived tenant).

### Changed

- `ApiClient` constructor accepts an optional second `ApiClientOptions`
  argument. Backwards-compatible.

### Fixed

- `Content-Type: application/<subtype>+json` responses (e.g.
  `application/scim+json`, `application/problem+json`) are now correctly
  parsed as JSON instead of falling through to text and being
  double-encoded downstream.
- v1 SCIM PATCH endpoints use the `PatchOp` schema.
- Path-template placeholders use `replaceAll`, fixing endpoints with
  duplicate `{tenant_id}` segments.
- Two server-side-broken v1 endpoints excluded from MCP tool
  registration so agents don't waste turns calling known-404 tools.

### Infrastructure

Developer-facing (not visible to consumers): GitHub Actions CI
(lint + typecheck + test + generator-drift detection), ESLint flat config
with husky pre-commit and commit-msg (Conventional Commits) hooks,
auto-correcting `core.hooksPath` install check.

## [0.1.0] - 2026-04-06

Initial published release. 102 v1 + 35 v0 tools over stdio transport.

[Unreleased]: https://github.com/gobeyondidentity/bi-mcp/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/gobeyondidentity/bi-mcp/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/gobeyondidentity/bi-mcp/releases/tag/v0.1.0

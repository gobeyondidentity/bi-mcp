import type { Config, Platform, Region } from "./types.js";

// Allow modest clock skew between issuer and local host so a token with
// sub-minute remaining lifetime doesn't fail startup with a confusing
// "expired" message. The BI API is the authority on actual token validity;
// this check exists only to catch clearly-stale tokens at boot.
const JWT_EXPIRY_SKEW_MS = 60_000;

const BASE_URLS: Record<Platform, Record<Region, string>> = {
  v1: {
    US: "https://api-us.beyondidentity.com",
    EU: "https://api-eu.beyondidentity.com",
  },
  v0: {
    US: "https://api.byndid.com",
    EU: "https://api-eu.byndid.com",
  },
};

function decodeJwtPayload(token: string): Record<string, unknown> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error(
      "API_KEY does not look like a Beyond Identity API key (expected a JWT with 3 segments)",
    );
  }

  // Note: Buffer.from(..., "base64") doesn't throw on malformed input — it
  // returns whatever it can decode and lets the downstream JSON.parse surface
  // the error. So the only failure mode here is "bad payload" via JSON.parse.
  const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const decoded = Buffer.from(padded, "base64").toString("utf-8");

  let payload: unknown;
  try {
    payload = JSON.parse(decoded);
  } catch {
    throw new Error(
      "API_KEY contains an invalid JWT (payload is not valid JSON)",
    );
  }

  if (typeof payload !== "object" || payload === null) {
    throw new Error(
      "API_KEY contains an invalid JWT (payload is not a JSON object)",
    );
  }

  return payload as Record<string, unknown>;
}

function detectPlatform(
  claims: Record<string, unknown>,
): { platform: Platform; tenantId: string } {
  // bi_t present → Secure Access (v1)
  if (typeof claims.bi_t === "string" && claims.bi_t.length > 0) {
    return { platform: "v1", tenantId: claims.bi_t };
  }

  // No bi_t, fall back to sub → Secure Workforce (v0)
  if (typeof claims.sub === "string" && claims.sub.length > 0) {
    return { platform: "v0", tenantId: claims.sub };
  }

  throw new Error(
    "API_KEY JWT is missing expected claims (need 'bi_t' or 'sub' for tenant identification)",
  );
}

export function loadConfig(): Config {
  const apiToken = process.env.API_KEY;
  if (!apiToken) {
    throw new Error("API_KEY environment variable is required");
  }

  const regionInput = (process.env.REGION ?? "US").toUpperCase();
  if (regionInput !== "US" && regionInput !== "EU") {
    throw new Error(
      `REGION must be "US" or "EU" (got "${process.env.REGION}")`,
    );
  }
  const region: Region = regionInput as Region;

  const claims = decodeJwtPayload(apiToken);

  // Fail fast on already-expired tokens — every API call would 401 otherwise,
  // with a confusing runtime error rather than a clear startup one.
  if (
    typeof claims.exp === "number" &&
    claims.exp * 1000 + JWT_EXPIRY_SKEW_MS < Date.now()
  ) {
    throw new Error(
      `API_KEY JWT expired on ${new Date(claims.exp * 1000).toISOString()}. Generate a fresh token from the admin console.`,
    );
  }

  const { platform, tenantId } = detectPlatform(claims);
  const baseUrl = process.env.BASE_URL || BASE_URLS[platform][region];

  return { apiToken, tenantId, platform, region, baseUrl };
}

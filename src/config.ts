import type { Config, Platform, Region } from "./types.js";

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

  let decoded: string;
  try {
    // Handle base64url encoding (replace - with +, _ with /, add padding)
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    decoded = Buffer.from(padded, "base64").toString("utf-8");
  } catch {
    throw new Error(
      "API_KEY contains an invalid JWT (payload is not valid base64)",
    );
  }

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
  const { platform, tenantId } = detectPlatform(claims);
  const baseUrl = process.env.BASE_URL || BASE_URLS[platform][region];

  return { apiToken, tenantId, platform, region, baseUrl };
}

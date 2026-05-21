/**
 * Build a syntactically-valid JWT with the given payload. The signature is a
 * dummy — we never verify signatures, only decode claims, so this is enough
 * for the JWT-parsing path under test.
 */
export function fakeJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" }))
    .toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = Buffer.from("fake-signature").toString("base64url");
  return `${header}.${body}.${sig}`;
}

import crypto from "crypto";

// ponytail: fail-fast in production — a hardcoded fallback secret would let anyone
// forge session tokens. Dev mode tolerates the placeholder for convenience.
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  (process.env.NODE_ENV === "production"
    ? (() => {
        throw new Error("SESSION_SECRET environment variable is required in production. Generate with: openssl rand -base64 32");
      })()
    : "86connect-dev-secret-change-in-production");

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function createSessionToken(email: string): string {
  const payload = JSON.stringify({ email, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return Buffer.from(payload).toString("base64") + "." + signature;
}

export function verifySessionToken(token: string): { email: string } | null {
  try {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return null;
    const payload = Buffer.from(payloadB64, "base64").toString();
    const expectedSig = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
    if (signature !== expectedSig) return null;
    const data = JSON.parse(payload);
    if (data.exp < Date.now()) return null;
    return { email: data.email };
  } catch {
    return null;
  }
}

// ── User session tokens ──

export function createUserSessionToken(userId: string, email: string): string {
  const payload = JSON.stringify({ userId, email, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 });
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return Buffer.from(payload).toString("base64") + "." + signature;
}

export function verifyUserSessionToken(token: string): { userId: string; email: string } | null {
  try {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return null;
    const payload = Buffer.from(payloadB64, "base64").toString();
    const expectedSig = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
    if (signature !== expectedSig) return null;
    const data = JSON.parse(payload);
    if (data.exp < Date.now()) return null;
    return { userId: data.userId, email: data.email };
  } catch {
    return null;
  }
}

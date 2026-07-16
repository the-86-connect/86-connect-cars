import crypto from "crypto";

// ponytail: fail-fast when actually used in production, not at module load time.
// Vercel builds with NODE_ENV=production but doesn't need SESSION_SECRET
// until runtime — throwing at import-time breaks the build.
let _sessionSecret: string | null = null;
function getSessionSecret(): string {
  if (_sessionSecret) return _sessionSecret;
  _sessionSecret = process.env.SESSION_SECRET || "";
  if (!_sessionSecret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET environment variable is required in production. Generate with: openssl -base64 32");
    }
    _sessionSecret = "86connect-dev-secret-change-in-production";
  }
  return _sessionSecret;
}

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function createSessionToken(id: string, email: string): string {
  const payload = JSON.stringify({ id, email, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  const signature = crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
  return Buffer.from(payload).toString("base64") + "." + signature;
}

export function verifySessionToken(token: string): { id: string; email: string } | null {
  try {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return null;
    const payload = Buffer.from(payloadB64, "base64").toString();
    const expectedSig = crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
    if (signature !== expectedSig) return null;
    const data = JSON.parse(payload);
    if (data.exp < Date.now()) return null;
    return { id: data.id, email: data.email };
  } catch {
    return null;
  }
}

// ── User session ──

export function createUserSessionToken(userId: string, email: string): string {
  const payload = JSON.stringify({ userId, email, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 });
  const signature = crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
  return Buffer.from(payload).toString("base64") + "." + signature;
}

export function verifyUserSessionToken(token: string): { userId: string; email: string } | null {
  try {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return null;
    const payload = Buffer.from(payloadB64, "base64").toString();
    const expectedSig = crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
    if (signature !== expectedSig) return null;
    const data = JSON.parse(payload);
    if (data.exp < Date.now()) return null;
    return { userId: data.userId, email: data.email };
  } catch {
    return null;
  }
}
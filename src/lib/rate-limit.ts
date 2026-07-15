import { NextRequest, NextResponse } from "next/server";

// ponytail: in-memory rate limiter — resets on server restart, doesn't work across
// multiple instances. Fine for single-process Render/Vercel. Upgrade to Redis/Upstash
// when scaling beyond one instance. Ceiling: ~1000 unique IPs tracked, then oldest evicted.

type RateBucket = { count: number; resetAt: number };

const buckets = new Map<string, RateBucket>();
const MAX_BUCKETS = 1000;

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

function evictOldest() {
  if (buckets.size < MAX_BUCKETS) return;
  let oldestKey: string | null = null;
  let oldestTime = Infinity;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < oldestTime) {
      oldestTime = bucket.resetAt;
      oldestKey = key;
    }
  }
  if (oldestKey) buckets.delete(oldestKey);
}

export function rateLimit(
  req: NextRequest,
  options: { windowMs: number; max: number; keyPrefix: string },
): NextResponse | null {
  const ip = getClientIp(req);
  const key = `${options.keyPrefix}:${ip}`;
  const now = Date.now();

  const existing = buckets.get(key);
  if (!existing || existing.resetAt < now) {
    evictOldest();
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return null;
  }

  existing.count++;
  if (existing.count > options.max) {
    const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
        },
      },
    );
  }

  return null;
}

// Pre-configured presets
export const rateLimitAuth = (req: NextRequest) =>
  rateLimit(req, { windowMs: 15 * 60 * 1000, max: 5, keyPrefix: "auth" });

export const rateLimitForm = (req: NextRequest) =>
  rateLimit(req, { windowMs: 60 * 60 * 1000, max: 10, keyPrefix: "form" });

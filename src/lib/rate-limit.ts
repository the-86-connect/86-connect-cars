import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

let authLimiter: Ratelimit | null = null;
let formLimiter: Ratelimit | null = null;
let frequencyLimiter: Ratelimit | null = null;

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function getAuthLimiter(): Ratelimit | null {
  if (authLimiter) return authLimiter;
  const redis = getRedis();
  if (!redis) return null;
  // 5 auth attempts per 15 min (general limiter)
  authLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    analytics: true,
  });
  return authLimiter;
}

function getFormLimiter(): Ratelimit | null {
  if (formLimiter) return formLimiter;
  const redis = getRedis();
  if (!redis) return null;
  formLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 h"),
    analytics: true,
  });
  return formLimiter;
}

function getFrequencyLimiter(): Ratelimit | null {
  if (frequencyLimiter) return frequencyLimiter;
  const redis = getRedis();
  if (!redis) return null;
  // More than 5 login attempts per 1 min → locked for 30 min
  frequencyLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    analytics: true,
  });
  return frequencyLimiter;
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

async function checkLimit(limiter: Ratelimit | null, req: NextRequest): Promise<NextResponse | null> {
  if (!limiter) return null; // fallback: allow all when Redis not configured

  const ip = getClientIp(req);
  const { success, limit, remaining, reset } = await limiter.limit(ip);
  if (success) return null;

  const retryAfter = Math.ceil((reset - Date.now()) / 1000);
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": String(remaining),
        "X-RateLimit-Reset": String(reset),
      },
    },
  );
}

export async function rateLimitAuth(req: NextRequest): Promise<NextResponse | null> {
  // 1. Check frequency: >5 per minute → lock for 30 min
  const freqLimited = await checkLimit(getFrequencyLimiter(), req);
  if (freqLimited) return freqLimited;

  // 2. Check general rate limit: 5 per 15 min
  const generalLimited = await checkLimit(getAuthLimiter(), req);
  if (generalLimited) return generalLimited;

  // 3. Check if IP is locked due to too many failed attempts (4 fails → 10 min lock)
  const redis = getRedis();
  if (redis) {
    const ip = getClientIp(req);
    const lockKey = `auth:lock:${ip}`;
    const lockedUntil = await redis.get(lockKey);
    if (lockedUntil) {
      const retryAfter = Math.ceil((Number(lockedUntil) - Date.now()) / 1000);
      return NextResponse.json(
        { error: `Account locked. Try again in ${Math.ceil(retryAfter / 60)} minutes.` },
        { status: 429, headers: { "Retry-After": String(Math.max(retryAfter, 0)) } },
      );
    }
  }

  return null;
}

/** Call this when a login attempt FAILS. After 4 failures → lock for 10 minutes. */
export async function recordFailedAuth(req: NextRequest): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  const ip = getClientIp(req);
  const failKey = `auth:fail:${ip}`;

  // Increment fail count, set TTL on first failure
  const fails = await redis.incr(failKey);
  if (fails === 1) {
    // First failure — set 10 min window
    await redis.expire(failKey, 600);
  }

  if (fails >= 4) {
    // Lock for 10 minutes
    const lockUntil = Date.now() + 10 * 60 * 1000;
    await redis.set(`auth:lock:${ip}`, lockUntil, { ex: 600 });
    // Clear fail counter
    await redis.del(failKey);
  }
}

/** Call this when login SUCCEEDS — clear fail counter */
export async function clearAuthFails(req: NextRequest): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  const ip = getClientIp(req);
  await redis.del(`auth:fail:${ip}`);
}

export async function rateLimitForm(req: NextRequest): Promise<NextResponse | null> {
  return checkLimit(getFormLimiter(), req);
}

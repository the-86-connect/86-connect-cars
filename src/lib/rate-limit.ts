import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

let authLimiter: Ratelimit | null = null;
let formLimiter: Ratelimit | null = null;

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
  return checkLimit(getAuthLimiter(), req);
}

export async function rateLimitForm(req: NextRequest): Promise<NextResponse | null> {
  return checkLimit(getFormLimiter(), req);
}
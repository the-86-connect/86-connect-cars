import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { rateLimitAuth } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limited = await rateLimitAuth(req);
  if (limited) return limited;

  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !url.startsWith("http") || !key || key === "your-anon-key") {
      return NextResponse.json({ error: "Auth not configured" }, { status: 503 });
    }

    const response = NextResponse.json({ success: true, user: {} });

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return req.cookies.getAll().map(({ name, value }) => ({ name, value }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const body = JSON.stringify({
      success: true,
      id: data.user.id,
      name: data.user.user_metadata?.name,
      email: data.user.email,
    });

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...Object.fromEntries(response.headers.entries()),
      },
    });
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
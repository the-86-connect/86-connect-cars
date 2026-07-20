import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { rateLimitAuth } from "@/lib/rate-limit";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const limited = await rateLimitAuth(req);
  if (limited) return limited;

  try {
    const { name, email, password, whatsapp, country } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password required" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !url.startsWith("http") || !key || key === "your-anon-key") {
      return NextResponse.json({ error: "Auth not configured" }, { status: 500 });
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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          whatsapp: whatsapp || null,
          country: country || null,
        },
      },
    });

    if (error) {
      if (error.message?.includes("already registered") || error.code === "user_already_exists") {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 });
      }
      return NextResponse.json({ error: error.message || "Signup failed" }, { status: 400 });
    }

    if (!data.user) {
      return NextResponse.json({ error: "Signup failed" }, { status: 500 });
    }

    // Create profile row in public.users (admin client bypasses RLS)
    try {
      const adminClient = getSupabaseAdmin();
      if (!adminClient) throw new Error("Database not configured");
      await adminClient.from("users").insert({
        id: data.user.id,
        name,
        email,
        password_hash: "",
        whatsapp: whatsapp || null,
        country: country || null,
      });
    } catch (profileError) {
      console.error("Failed to create user profile:", profileError);
    }

    // Fire-and-forget welcome email — never fail signup on email error
    sendWelcomeEmail(email, name).catch((e) => console.error("Welcome email failed:", e));

    // Write success body into the same response that already has auth cookies set
    const body = JSON.stringify({
      success: true,
      user: { id: data.user.id, email: data.user.email, name },
    });

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...Object.fromEntries(response.headers.entries()),
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
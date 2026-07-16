import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
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

    const supabase = await getSupabaseServer();
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
      await adminClient.from("users").insert({
        id: data.user.id,
        name,
        email,
        password_hash: "", // no longer storing password hashes locally
        whatsapp: whatsapp || null,
        country: country || null,
      });
    } catch (profileError) {
      console.error("Failed to create user profile:", profileError);
      // Don't fail the signup — user was created in Auth
    }

    // Fire-and-forget welcome email — never fail signup on email error
    sendWelcomeEmail(email, name).catch((e) => console.error("Welcome email failed:", e));

    return NextResponse.json({
      success: true,
      user: { id: data.user.id, email: data.user.email, name },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { rateLimitAuth } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limited = await rateLimitAuth(req);
  if (limited) return limited;

  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const supabase = await getSupabaseServer();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      id: data.user.id,
      name: data.user.user_metadata?.name,
      email: data.user.email,
    });
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
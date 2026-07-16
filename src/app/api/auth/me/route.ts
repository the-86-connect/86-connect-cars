import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin-session")?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const session = verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // Verify admin still exists in the database
  const adminClient = getSupabaseAdmin();
  const { data: admin, error } = await adminClient
    .from("admins")
    .select("*")
    .eq("id", session.id)
    .maybeSingle();

  if (error || !admin) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, email: admin.email });
}
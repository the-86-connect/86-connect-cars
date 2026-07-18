import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await getSupabaseServer();
  if (!supabase) return NextResponse.json({ success: true });
  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}
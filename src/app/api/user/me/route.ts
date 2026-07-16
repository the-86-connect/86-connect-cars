import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    id: data.user.id,
    name: data.user.user_metadata?.name,
    email: data.user.email,
    whatsapp: data.user.user_metadata?.whatsapp,
    country: data.user.user_metadata?.country,
  });
}
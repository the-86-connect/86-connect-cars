import { createClient } from "@supabase/supabase-js";

/** Admin client with service_role key — bypasses RLS for server-side CRUD.
 *  Only use in server-side code (API routes, server components).
 *  Never expose to the browser. */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
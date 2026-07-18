import { createClient, SupabaseClient } from "@supabase/supabase-js";

/** Admin client with service_role key — bypasses RLS for server-side CRUD.
 *  Only use in server-side code (API routes, server components).
 *  Never expose to the browser.
 *  Returns null if env vars are missing/placeholder — callers should handle gracefully. */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !url.startsWith("http") || !key || key === "your-service-role-key") {
    return null;
  }
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

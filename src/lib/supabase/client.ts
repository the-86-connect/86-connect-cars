import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Browser Supabase client. Lazy — only created when first accessed, and only if env vars are valid. */
let _client: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient | null {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !url.startsWith("http") || !key || key === "your-anon-key") {
    return null;
  }
  _client = createBrowserClient(url, key);
  return _client;
}

/** @deprecated Use getSupabaseBrowser() instead */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const c = getSupabaseBrowser();
    if (!c) throw new Error("Supabase browser client not configured");
    return Reflect.get(c, prop);
  },
});

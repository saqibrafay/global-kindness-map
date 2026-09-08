import { createClient } from "@supabase/supabase-js";

/**
 * Server-side read-only Supabase client (uses the anon key — same
 * permissions as the browser client). Used in server components / route
 * handlers that only need to SELECT approved pins.
 */
export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}

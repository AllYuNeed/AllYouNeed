import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { REASON_TEXT, supabaseConfig } from "./config";
import type { Database } from "./database.types";

export type AppSupabaseClient = SupabaseClient<Database>;

let client: AppSupabaseClient | null | undefined;

/**
 * The one browser Supabase client, created on first use. Returns null when Supabase is not configured (or on the
 * server, where this static site never talks to Supabase), so every caller must handle "no backend" explicitly.
 *
 * Auth uses the PKCE flow: email links come back with a one-time `?code=` that this client exchanges for a
 * session (see app/auth/callback). The session lives in localStorage; there is no server to hold cookies.
 */
export function getSupabase(): AppSupabaseClient | null {
  if (typeof window === "undefined") return null;
  if (client !== undefined) return client;

  if (!supabaseConfig.configured) {
    // "missing" is the normal state of a fresh checkout, so stay quiet; anything else is a mistake worth shouting about.
    if (supabaseConfig.reason !== "missing") console.error(REASON_TEXT[supabaseConfig.reason]);
    client = null;
    return client;
  }

  client = createClient<Database>(supabaseConfig.url, supabaseConfig.key, {
    auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}

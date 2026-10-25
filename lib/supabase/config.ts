/**
 * Supabase configuration, read from environment variables at BUILD time (this is a static export: Next inlines
 * `NEXT_PUBLIC_*` values into the JavaScript bundle when `npm run build` runs, so the variables must be present
 * in the build environment of whatever hosts the site).
 *
 *   NEXT_PUBLIC_SUPABASE_URL              https://<project-ref>.supabase.co
 *   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  the publishable key (sb_publishable_...) - or the legacy anon JWT in
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY         (read as a fallback so existing projects work unchanged)
 *
 * Only the PUBLIC key may ever be used here. Everything in a `NEXT_PUBLIC_*` variable is shipped to every
 * visitor, so a secret/service-role key would hand over the whole database. `readSupabaseConfig` refuses one.
 */

export type SupabaseConfig =
  | { configured: true; url: string; key: string }
  | { configured: false; reason: "missing" | "placeholder" | "invalid-url" | "invalid-key" | "privileged-key" };

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/** True for a Supabase secret key (`sb_secret_...`) or a legacy JWT whose role is `service_role`. */
export function isPrivilegedKey(rawKey: string): boolean {
  // Hosting dashboards sometimes keep the quotes someone pasted around a value; look at the value itself.
  const key = rawKey.trim().replace(/^["'`]+|["'`]+$/g, "");
  if (key.includes("sb_secret_")) return true;
  const parts = key.split(".");
  if (parts.length !== 3) return false;
  try {
    const json = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(parts[1].length / 4) * 4, "="));
    const role = (JSON.parse(json) as { role?: unknown }).role;
    return role === "service_role" || role === "supabase_admin";
  } catch {
    return false;
  }
}

/**
 * Build-time guard, called from next.config.ts. Refusing a privileged key at RUNTIME is not enough: Next.js copies the
 * value of every NEXT_PUBLIC_* variable that the code references into the JavaScript bundle during the build (the two
 * key variables here are referenced), so a secret placed in one would still be published to every visitor. Failing the
 * build (and `next dev`) is the only safe answer, and it covers variables nobody has referenced yet.
 */
export function assertNoPrivilegedKeys(env: Record<string, string | undefined>): void {
  for (const [name, raw] of Object.entries(env)) {
    if (!name.startsWith("NEXT_PUBLIC_")) continue;
    const value = (raw ?? "").trim();
    const namedLikeASecret = /SERVICE[_-]?ROLE|SECRET/i.test(name);
    if (isPrivilegedKey(value) || (namedLikeASecret && value !== "")) {
      throw new Error(
        `${name} holds a Supabase secret / service-role key (or is named like one). Everything in a NEXT_PUBLIC_ variable is published to every visitor. ` +
          "Remove it from your environment and .env files, and ROTATE the key in the Supabase dashboard if it has ever been deployed. Use the publishable (anon) key instead."
      );
    }
  }
}

export function readSupabaseConfig(env: { url?: string; key?: string }): SupabaseConfig {
  const url = (env.url ?? "").trim();
  const key = (env.key ?? "").trim();
  if (!url || !key) return { configured: false, reason: "missing" };

  // The values shipped in .env.example: copying that file without editing it must not look "configured".
  if (/YOUR[-_]/.test(url) || /YOUR[-_]/.test(key)) return { configured: false, reason: "placeholder" };

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { configured: false, reason: "invalid-url" };
  }
  const secure = parsed.protocol === "https:";
  const local = parsed.protocol === "http:" && LOCAL_HOSTS.has(parsed.hostname);
  if (!secure && !local) return { configured: false, reason: "invalid-url" };

  // Check this BEFORE the shape check so the dangerous case gets its own, loud, reason.
  if (isPrivilegedKey(key)) return { configured: false, reason: "privileged-key" };
  if (!/^(sb_publishable_|eyJ)/.test(key)) return { configured: false, reason: "invalid-key" };

  return { configured: true, url: parsed.origin, key };
}

// Each variable must be referenced as a literal `process.env.NEXT_PUBLIC_...` so the bundler can inline it.
export const supabaseConfig: SupabaseConfig = readSupabaseConfig({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

export const isSupabaseConfigured = supabaseConfig.configured;

export const REASON_TEXT: Record<Exclude<SupabaseConfig, { configured: true }>["reason"], string> = {
  missing: "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (see docs/SUPABASE_SETUP.md).",
  placeholder: "Supabase is not configured: the environment variables still hold the placeholder values from .env.example.",
  "invalid-url": "Supabase is not configured: NEXT_PUBLIC_SUPABASE_URL must be an https:// URL (or http://localhost for the local CLI).",
  "invalid-key": "Supabase is not configured: the key must be the publishable key (sb_publishable_...) or the legacy anon key.",
  "privileged-key": "REFUSING to use the Supabase key: it is a secret / service-role key. Never put one in a NEXT_PUBLIC_ variable; use the publishable (anon) key.",
};

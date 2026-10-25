/**
 * Validates a post-login destination taken from the URL (`/login/?next=/account/`). Only same-site paths are
 * accepted, so a crafted link can never bounce a freshly signed-in user to another website.
 *
 * The value is parsed and the NORMALISED path is what gets returned. Judging the raw text is not enough:
 * `/.//evil.example` and `/%2e//evil.example` look like harmless paths but normalise to `//evil.example`, which a
 * browser treats as another site.
 */
export function safeNext(raw: string | null | undefined, fallback = "/account/"): string {
  if (!raw) return fallback;
  // Must be an absolute path on this site: "/x" yes; "https://evil.com", "x", "//evil.com" no. No backslashes at all
  // (browsers treat "/\\" like "//").
  if (!raw.startsWith("/") || raw.includes("\\")) return fallback;
  // No control characters or whitespace (header-splitting tricks, odd browser parsing).
  for (const ch of raw) {
    const code = ch.codePointAt(0)!;
    if (code <= 0x20 || code === 0x7f) return fallback;
  }
  try {
    const base = "https://site.invalid";
    const url = new URL(raw, base);
    if (url.origin !== base) return fallback;
    // After normalisation a path that starts "//" would be read as protocol-relative.
    if (url.pathname.startsWith("//")) return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}

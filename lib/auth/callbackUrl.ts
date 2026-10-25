/**
 * Reads the error Supabase appends to the callback URL when an email link fails (`?error=access_denied&error_code=otp_expired`
 * with PKCE, or the same in the `#fragment` for the older implicit flow).
 *
 * Returns FIXED wording only, never the `error_description` text from the URL: anyone can craft a link to this page,
 * and showing their words to a visitor would let them put text in front of our logo.
 */
export function readAuthError(search: string, hash: string): string | null {
  const query = new URLSearchParams(search);
  const fragment = new URLSearchParams(hash.replace(/^#/, ""));
  const code = query.get("error_code") ?? fragment.get("error_code");
  const error = query.get("error") ?? fragment.get("error");
  if (!code && !error) return null;
  if (code === "otp_expired") return "This link has expired or was already used. Request a new one and try again.";
  return "We couldn't verify that link. Request a new one and try again.";
}

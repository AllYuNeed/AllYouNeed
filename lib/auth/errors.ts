type AuthErrorLike = { code?: string; message?: string; name?: string; status?: number } | null | undefined;

const GENERIC = "Something went wrong. Please try again.";

/**
 * Turns a Supabase Auth error into text a visitor can act on. Never echoes the raw server message (it can contain
 * internals), and deliberately says nothing that tells an attacker whether an email has an account.
 */
export function friendlyAuthError(error: AuthErrorLike): string {
  if (!error) return GENERIC;
  switch (error.code) {
    case "invalid_credentials":
      return "That email and password don't match. Check them and try again.";
    case "email_not_confirmed":
      return "Please confirm your email first: open the link we sent you, then log in.";
    case "user_already_exists":
    case "email_exists":
      return "An account with that email may already exist. Try logging in, or reset your password.";
    case "weak_password":
      return "Choose a stronger password: longer is better, and avoid common words.";
    case "same_password":
      return "Choose a password you are not already using.";
    case "signup_disabled":
    case "email_provider_disabled":
      return "Sign-ups are closed right now. Please contact us.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
    case "over_sms_send_rate_limit":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "email_address_not_authorized":
      return "We can't send email to that address yet. Please contact us.";
    case "email_address_invalid":
      return "That email address doesn't look right. Check it and try again.";
    case "reauthentication_needed":
    case "reauth_nonce_missing":
    case "reauthentication_not_valid":
      return "For your security, please log in again before changing your password.";
    case "flow_state_expired":
    case "flow_state_not_found":
    case "bad_code_verifier":
      return "That link has expired or was opened in a different browser. Request a new one.";
    case "user_banned":
      return "This account can't be used right now. Please contact us.";
    case "captcha_failed":
      return "We couldn't verify you're human. Please try again.";
    case "session_not_found":
    case "refresh_token_not_found":
      return "Your session has ended. Please log in again.";
    default:
      break;
  }
  // supabase-js reports network failures as a retryable fetch error with status 0 and no code.
  if (error.name === "AuthRetryableFetchError" || error.status === 0 || /failed to fetch|network/i.test(error.message ?? "")) {
    return "We couldn't reach the server. Check your connection and try again.";
  }
  return GENERIC;
}

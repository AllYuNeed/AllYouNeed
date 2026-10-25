import { site } from "@/content/site";
import type { ContactOutput, NewsletterOutput } from "@/lib/schemas";
import type { FormTransport } from "@/lib/forms";
import { getSupabase } from "./client";

// While the contact details are placeholders, pointing visitors at them would send them nowhere.
const NOT_CONNECTED = site.contactIsPlaceholder
  ? "This form isn't connected to our database yet, so nothing was sent. Please try again later."
  : `This form isn't connected to our database yet, so nothing was sent. Please email ${site.email} instead.`;
const INVALID = "Some details look invalid. Please check the form and try again.";
const FAILED = "We couldn't send that. Please try again in a moment.";

/** Postgres "check_violation": a constraint in the migration rejected a value the browser validation let through. */
const CHECK_VIOLATION = "23514";

/**
 * Where contact and newsletter submissions go: straight into Supabase, using the public key and the insert-only
 * policies from supabase/migrations. The browser can write these rows but never read them back.
 */
export const supabaseFormTransport: FormTransport = async (kind, data) => {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: NOT_CONNECTED };

  if (kind === "contact") {
    const c = data as ContactOutput;
    // No `.select()`: there is deliberately no read policy, and the default response is "return=minimal".
    const { error } = await supabase.from("contact_requests").insert({
      name: c.name,
      email: c.email,
      phone: c.phone,
      company: c.company,
      team_size: c.teamSize,
      modules: c.modules,
      message: c.message ?? "",
    });
    if (!error) return { ok: true };
    return { ok: false, error: error.code === CHECK_VIOLATION ? INVALID : FAILED };
  }

  if (kind === "newsletter") {
    const n = data as NewsletterOutput;
    // A function rather than a table insert: it ignores duplicates silently, so nobody can probe who is subscribed.
    const { error } = await supabase.rpc("subscribe_to_newsletter", { p_email: n.email, p_whatsapp: n.phone ?? "" });
    if (!error) return { ok: true };
    return { ok: false, error: error.code === CHECK_VIOLATION ? INVALID : FAILED };
  }

  return { ok: false, error: FAILED };
};

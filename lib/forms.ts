import { supabaseFormTransport } from "@/lib/supabase/formTransport";

/** Login, register and password reset talk to Supabase Auth directly (lib/auth); only these two are plain submissions. */
export type FormKind = "contact" | "newsletter";
export type FormResult = { ok: true } | { ok: false; error: string };
export type FormTransport = (kind: FormKind, data: unknown) => Promise<FormResult>;

/**
 * The ONLY place contact / newsletter submissions leave the browser: Supabase (lib/supabase/formTransport.ts).
 * Without Supabase settings it reports that the form isn't connected rather than pretending to succeed.
 */
const defaultTransport: FormTransport = supabaseFormTransport;

let transport: FormTransport = defaultTransport;

/** Test hook: inject a transport, or pass null to restore the default. */
export function setFormTransport(fn: FormTransport | null) {
  transport = fn ?? defaultTransport;
}

/**
 * Always resolves. A transport that throws or rejects (fetch does on network or CORS failure) becomes an
 * error result, so the forms show their error + Retry state instead of sticking on "submitting".
 */
export async function submitForm(kind: FormKind, data: unknown): Promise<FormResult> {
  try {
    return await transport(kind, data);
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

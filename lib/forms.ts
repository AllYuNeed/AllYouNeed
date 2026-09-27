export type FormKind = "contact" | "newsletter" | "login" | "register";
export type FormResult = { ok: true } | { ok: false; error: string };
export type FormTransport = (kind: FormKind, data: unknown) => Promise<FormResult>;

/**
 * The ONLY place form submissions leave the browser.
 * Today: no backend — wait briefly and succeed.
 * Later: replace the body with a fetch() to Formspree / an API route.
 */
const defaultTransport: FormTransport = async () => {
  await new Promise((r) => setTimeout(r, 800));
  return { ok: true };
};

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

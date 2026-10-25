import { test, expect, vi, afterEach } from "vitest";
import { submitForm, setFormTransport } from "@/lib/forms";
import { site } from "@/content/site";

afterEach(() => {
  setFormTransport(null);
});

test("with no Supabase settings the default transport says the form isn't connected, instead of pretending to succeed", async () => {
  const result = await submitForm("contact", { name: "x" });
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.error).toMatch(/isn't connected/i);
    // Pointing visitors at a placeholder address would send them nowhere, so it is only named once the details are real.
    expect(site.contactIsPlaceholder).toBe(true);
    expect(result.error).not.toContain(site.email);
  }
});

test("a custom transport can fail", async () => {
  setFormTransport(async () => ({ ok: false, error: "Network down" }));
  await expect(submitForm("newsletter", { email: "a@b.co" })).resolves.toEqual({ ok: false, error: "Network down" });
});

test("a transport that throws or rejects resolves to an error result instead of escaping", async () => {
  const failed = { ok: false, error: "Something went wrong. Please try again." };
  setFormTransport(() => {
    throw new TypeError("Failed to fetch");
  });
  await expect(submitForm("contact", { name: "x" })).resolves.toEqual(failed);
  setFormTransport(() => Promise.reject(new TypeError("NetworkError when attempting to fetch resource.")));
  await expect(submitForm("newsletter", { email: "a@b.co" })).resolves.toEqual(failed);
});

test("transport receives kind and data", async () => {
  const spy = vi.fn(async () => ({ ok: true as const }));
  setFormTransport(spy);
  await submitForm("newsletter", { email: "a@b.co" });
  expect(spy).toHaveBeenCalledWith("newsletter", { email: "a@b.co" });
});

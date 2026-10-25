import { describe, test, expect, vi, beforeEach } from "vitest";
import { fakeSupabase } from "../helpers/fakeSupabase";

const h = vi.hoisted(() => ({ client: null as unknown }));
vi.mock("@/lib/supabase/client", () => ({ getSupabase: () => h.client }));

import { supabaseFormTransport } from "@/lib/supabase/formTransport";
import { site } from "@/content/site";

const contact = { name: "Priya", email: "priya@example.test", phone: "9876543210", company: "Test Co", teamSize: "11-50", modules: ["accounting", "tax-filing"], message: "Hi" };

let fake: ReturnType<typeof fakeSupabase>;
beforeEach(() => {
  fake = fakeSupabase();
  h.client = fake;
});

describe("contact", () => {
  test("inserts the request into contact_requests using the database's column names, and reads nothing back", async () => {
    await expect(supabaseFormTransport("contact", contact)).resolves.toEqual({ ok: true });
    expect(fake.from).toHaveBeenCalledWith("contact_requests");
    const b = fake.builders.contact_requests;
    expect(b.insert).toHaveBeenCalledWith({
      name: "Priya",
      email: "priya@example.test",
      phone: "9876543210",
      company: "Test Co",
      team_size: "11-50",
      modules: ["accounting", "tax-filing"],
      message: "Hi",
    });
    expect(b.select).not.toHaveBeenCalled(); // there is deliberately no read policy
  });

  test("never sends the fields the database decides (id, user_id, status, created_at)", async () => {
    await supabaseFormTransport("contact", { ...contact, status: "closed", user_id: "someone", id: "x" });
    const row = fake.builders.contact_requests.insert.mock.calls[0][0] as Record<string, unknown>;
    expect(Object.keys(row).sort()).toEqual(["company", "email", "message", "modules", "name", "phone", "team_size"]);
  });

  test("a constraint violation is reported as invalid details; anything else as a retryable failure", async () => {
    h.client = fakeSupabase({ contact_requests: { error: { code: "23514", message: "violates check constraint" } } });
    const invalid = await supabaseFormTransport("contact", contact);
    expect(invalid).toEqual({ ok: false, error: expect.stringMatching(/details look invalid/i) });

    h.client = fakeSupabase({ contact_requests: { error: { code: "PGRST301", message: "JWT expired" } } });
    const failed = await supabaseFormTransport("contact", contact);
    expect(failed).toEqual({ ok: false, error: expect.stringMatching(/couldn't send that/i) });
    expect(JSON.stringify(failed)).not.toMatch(/JWT/); // server text is never shown
  });
});

describe("newsletter", () => {
  test("calls the subscribe function, which ignores duplicates, instead of touching the table", async () => {
    await expect(supabaseFormTransport("newsletter", { email: "a@example.test", phone: "9876543210" })).resolves.toEqual({ ok: true });
    expect(fake.rpc).toHaveBeenCalledWith("subscribe_to_newsletter", { p_email: "a@example.test", p_whatsapp: "9876543210" });
    expect(fake.from).not.toHaveBeenCalled();
  });

  test("the WhatsApp number is optional", async () => {
    await supabaseFormTransport("newsletter", { email: "a@example.test", phone: "" });
    expect(fake.rpc).toHaveBeenCalledWith("subscribe_to_newsletter", { p_email: "a@example.test", p_whatsapp: "" });
  });

  test("errors are reported without the server's wording", async () => {
    fake.rpc.mockResolvedValueOnce({ data: null, error: { code: "23514", message: "x" } });
    expect(await supabaseFormTransport("newsletter", { email: "a@example.test" })).toEqual({ ok: false, error: expect.stringMatching(/details look invalid/i) });
    fake.rpc.mockResolvedValueOnce({ data: null, error: { code: "500", message: "x" } });
    expect(await supabaseFormTransport("newsletter", { email: "a@example.test" })).toEqual({ ok: false, error: expect.stringMatching(/couldn't send that/i) });
  });
});

describe("without Supabase settings", () => {
  test("says plainly that nothing was sent (and does not point at a placeholder address)", async () => {
    h.client = null;
    for (const kind of ["contact", "newsletter"] as const) {
      const result = await supabaseFormTransport(kind, contact);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toMatch(/nothing was sent/i);
        expect(site.contactIsPlaceholder).toBe(true);
        expect(result.error).not.toContain(site.email);
      }
    }
  });
});

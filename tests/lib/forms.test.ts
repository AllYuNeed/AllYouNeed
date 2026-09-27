import { test, expect, vi, afterEach } from "vitest";
import { submitForm, setFormTransport } from "@/lib/forms";

afterEach(() => {
  setFormTransport(null);
  vi.useRealTimers();
});

test("default transport resolves ok after a short delay", async () => {
  vi.useFakeTimers();
  const p = submitForm("contact", { name: "x" });
  await vi.advanceTimersByTimeAsync(800);
  await expect(p).resolves.toEqual({ ok: true });
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
  await expect(submitForm("register", { name: "x" })).resolves.toEqual(failed);
});

test("transport receives kind and data", async () => {
  const spy = vi.fn(async () => ({ ok: true as const }));
  setFormTransport(spy);
  await submitForm("login", { email: "a@b.co" });
  expect(spy).toHaveBeenCalledWith("login", { email: "a@b.co" });
});

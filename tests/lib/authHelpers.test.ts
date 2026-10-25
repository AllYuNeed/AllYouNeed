import { describe, test, expect } from "vitest";
import { safeNext } from "@/lib/auth/redirect";
import { friendlyAuthError } from "@/lib/auth/errors";
import { readAuthError } from "@/lib/auth/callbackUrl";
import { forgotPasswordSchema, profileSchema, resetPasswordSchema } from "@/lib/schemas";

describe("safeNext", () => {
  test("keeps same-site paths, with query and hash", () => {
    expect(safeNext("/pricing/")).toBe("/pricing/");
    expect(safeNext("/account/?tab=profile#details")).toBe("/account/?tab=profile#details");
    expect(safeNext("/")).toBe("/");
  });

  test("falls back for nothing, and for anything that could leave the site", () => {
    expect(safeNext(null)).toBe("/account/");
    expect(safeNext(undefined)).toBe("/account/");
    expect(safeNext("")).toBe("/account/");
    for (const bad of ["//evil.example", "///evil.example", "/\\evil.example", "https://evil.example", "http://evil.example/x", "javascript:alert(1)", "evil.example", "pricing", "data:text/html,x"]) {
      expect(safeNext(bad), bad).toBe("/account/");
    }
  });

  test("falls back for dot-segment tricks that normalise to a protocol-relative URL (//evil.example)", () => {
    // Each of these looks like a harmless path but resolves to "//evil.example", which a browser reads as another site.
    for (const bad of ["/.//evil.example", "/..//evil.example", "/%2e//evil.example", "/%2E/%2e//evil.example", "/a/../..//evil.example", "/././/evil.example/login"]) {
      expect(safeNext(bad), bad).toBe("/account/");
    }
  });

  test("returns the NORMALISED path, so what is followed is exactly what was checked", () => {
    expect(safeNext("/a/../pricing/")).toBe("/pricing/");
    expect(safeNext("/./account/#x")).toBe("/account/#x");
    expect(safeNext("/features/?x=1")).toBe("/features/?x=1");
    expect(safeNext("/%2e%2e/pricing/")).toBe("/pricing/");
    expect(safeNext("/a/.//b")).toBe("/a//b"); // a doubled slash INSIDE a path stays on this site
  });

  test("falls back for any backslash", () => {
    for (const bad of ["/\\evil.example", "/ok\\path", "/a/b\\"]) expect(safeNext(bad), bad).toBe("/account/");
  });

  test("falls back for control characters and whitespace", () => {
    for (const bad of ["/ok\n//evil.example", "/ok\r", "/ok\t", "/a b", "/\u0000", "/ok\u007f"]) {
      expect(safeNext(bad), JSON.stringify(bad)).toBe("/account/");
    }
  });

  test("honours a custom fallback", () => {
    expect(safeNext("//evil.example", "/")).toBe("/");
  });
});

describe("friendlyAuthError", () => {
  test("maps the codes visitors will actually hit", () => {
    expect(friendlyAuthError({ code: "invalid_credentials" })).toMatch(/don't match/i);
    expect(friendlyAuthError({ code: "email_not_confirmed" })).toMatch(/confirm your email/i);
    expect(friendlyAuthError({ code: "weak_password" })).toMatch(/stronger password/i);
    expect(friendlyAuthError({ code: "over_request_rate_limit" })).toMatch(/too many attempts/i);
    expect(friendlyAuthError({ code: "over_email_send_rate_limit" })).toMatch(/too many attempts/i);
    expect(friendlyAuthError({ code: "same_password" })).toMatch(/not already using/i);
    expect(friendlyAuthError({ code: "signup_disabled" })).toMatch(/closed/i);
  });

  test("recognises a network failure", () => {
    expect(friendlyAuthError({ name: "AuthRetryableFetchError", status: 0, message: "Failed to fetch" })).toMatch(/couldn't reach the server/i);
    expect(friendlyAuthError({ message: "NetworkError when attempting to fetch resource." })).toMatch(/couldn't reach the server/i);
  });

  test("maps the codes that appear once email, password-change and link flows are in use", () => {
    expect(friendlyAuthError({ code: "email_address_not_authorized" })).toMatch(/can't send email/i);
    expect(friendlyAuthError({ code: "email_address_invalid" })).toMatch(/doesn't look right/i);
    expect(friendlyAuthError({ code: "reauthentication_needed" })).toMatch(/log in again/i);
    expect(friendlyAuthError({ code: "reauth_nonce_missing" })).toMatch(/log in again/i);
    expect(friendlyAuthError({ code: "flow_state_expired" })).toMatch(/expired or was opened in a different browser/i);
    expect(friendlyAuthError({ code: "bad_code_verifier" })).toMatch(/different browser/i);
    expect(friendlyAuthError({ code: "user_banned" })).toMatch(/can't be used/i);
  });

  test("the weak-password message does not promise a specific length the server may not use", () => {
    expect(friendlyAuthError({ code: "weak_password" })).not.toMatch(/\d/);
  });

  test("never echoes an unknown server message", () => {
    const text = friendlyAuthError({ code: "weird_internal_thing", message: "duplicate key value violates unique constraint users_email_key" });
    expect(text).toBe("Something went wrong. Please try again.");
    expect(friendlyAuthError(null)).toBe("Something went wrong. Please try again.");
  });
});

describe("readAuthError", () => {
  test("reads an error from the query string or the fragment, with fixed wording", () => {
    expect(readAuthError("?error=access_denied&error_code=otp_expired&error_description=anything", "")).toMatch(/expired or was already used/i);
    expect(readAuthError("", "#error=access_denied&error_code=otp_expired")).toMatch(/expired or was already used/i);
    expect(readAuthError("?error=server_error", "")).toMatch(/couldn't verify that link/i);
  });

  test("returns null when there is no error, and never repeats text from the URL", () => {
    expect(readAuthError("?code=abc", "")).toBeNull();
    expect(readAuthError("", "")).toBeNull();
    expect(readAuthError("?error=x&error_description=Click+evil.example", "")).not.toMatch(/evil/);
  });
});

describe("account schemas", () => {
  test("forgot-password normalises the email", () => {
    expect(forgotPasswordSchema.parse({ email: "  A@B.CO " }).email).toBe("a@b.co");
    expect(forgotPasswordSchema.safeParse({ email: "nope" }).success).toBe(false);
  });

  test("reset-password needs 8+ characters that match", () => {
    expect(resetPasswordSchema.safeParse({ password: "longenough", confirm: "longenough" }).success).toBe(true);
    expect(resetPasswordSchema.safeParse({ password: "short", confirm: "short" }).success).toBe(false);
    const mismatch = resetPasswordSchema.safeParse({ password: "longenough", confirm: "different1" });
    expect(mismatch.success).toBe(false);
    if (!mismatch.success) expect(mismatch.error.issues[0].path).toEqual(["confirm"]);
  });

  test("profile: optional phone is normalised; an invalid one is rejected; blanks are allowed", () => {
    expect(profileSchema.parse({ fullName: " A ", company: "B", phone: "+91 98765 43210" })).toEqual({ fullName: "A", company: "B", phone: "9876543210" });
    expect(profileSchema.parse({ fullName: "", company: "", phone: "" }).phone).toBe("");
    expect(profileSchema.safeParse({ fullName: "A", company: "B", phone: "12345" }).success).toBe(false);
    expect(profileSchema.safeParse({ fullName: "x".repeat(121), company: "", phone: "" }).success).toBe(false);
  });
});

describe("schema length limits mirror the database", () => {
  test("contact and register reject over-long names, companies and emails with a message on the right field", async () => {
    const { contactSchema, registerSchema } = await import("@/lib/schemas");
    const contact = { name: "Ab", email: "a@b.co", phone: "9876543210", company: "Co", teamSize: "1-10", modules: ["hr"] } as const;
    expect(contactSchema.safeParse(contact).success).toBe(true); // the baseline is valid, so each failure below is the length rule
    expect(contactSchema.safeParse({ ...contact, name: "x".repeat(120) + "y" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...contact, name: "x".repeat(120) }).success).toBe(true);
    expect(contactSchema.safeParse({ ...contact, company: "x".repeat(161) }).success).toBe(false);
    expect(contactSchema.safeParse({ ...contact, email: "a".repeat(250) + "@b.co" }).success).toBe(false);
    const reg = registerSchema.safeParse({ name: "x".repeat(121), email: "a@b.co", phone: "9876543210", company: "Co", password: "longenough" });
    expect(reg.success).toBe(false);
    if (!reg.success) expect(reg.error.issues[0].path).toEqual(["name"]);
  });
});

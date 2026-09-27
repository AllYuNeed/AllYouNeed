import { describe, test, expect } from "vitest";
import { contactSchema, newsletterSchema, loginSchema, registerSchema, phoneSchema } from "@/lib/schemas";

const validContact = {
  name: "Priya Nair",
  email: "priya@meridianfoods.in",
  phone: "9876543210",
  company: "Meridian Foods",
  teamSize: "11-50",
  modules: ["accounting", "payroll"],
  message: "",
};

describe("contactSchema", () => {
  test("accepts a valid submission", () => {
    expect(contactSchema.safeParse(validContact).success).toBe(true);
  });
  test("rejects bad email, bad phone, missing name, empty modules", () => {
    expect(contactSchema.safeParse({ ...validContact, email: "priya@" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...validContact, phone: "12345" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...validContact, phone: "5876543210" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...validContact, name: " " }).success).toBe(false);
    expect(contactSchema.safeParse({ ...validContact, modules: [] }).success).toBe(false);
  });
  test("phone accepts +91 and spaces and normalises to 10 digits", () => {
    const r = contactSchema.safeParse({ ...validContact, phone: "+91 98765 43210" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.phone).toBe("9876543210");
  });
});

describe("phoneSchema normalisation (the formats lib/schemas.ts documents)", () => {
  test("a leading trunk 0 and spaces are stripped", () => {
    expect(phoneSchema.parse("098765 43210")).toBe("9876543210");
  });
  test("a bare 91 country code is stripped from a 12-digit number", () => {
    expect(phoneSchema.parse("919876543210")).toBe("9876543210");
  });
  test("a 10-digit number that merely starts with 91 is kept intact", () => {
    expect(phoneSchema.parse("9191919191")).toBe("9191919191");
  });
});

describe("newsletterSchema", () => {
  test("email is trimmed and lowercased before it is validated", () => {
    expect(newsletterSchema.parse({ email: "  Priya@X.IN " }).email).toBe("priya@x.in");
  });

  test("email required, phone optional", () => {
    expect(newsletterSchema.safeParse({ email: "a@b.co" }).success).toBe(true);
    expect(newsletterSchema.safeParse({ email: "a@b.co", phone: "" }).success).toBe(true);
    expect(newsletterSchema.safeParse({ email: "a@b.co", phone: "123" }).success).toBe(false);
    expect(newsletterSchema.safeParse({ email: "nope" }).success).toBe(false);
  });
});

describe("auth schemas", () => {
  test("login needs email and password", () => {
    expect(loginSchema.safeParse({ email: "a@b.co", password: "secret123" }).success).toBe(true);
    expect(loginSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false);
  });
  test("register enforces 8+ char password and required fields", () => {
    const ok = { name: "Arjun", email: "arjun@vasant.in", phone: "9123456780", company: "Vasant Interiors", password: "longenough" };
    expect(registerSchema.safeParse(ok).success).toBe(true);
    expect(registerSchema.safeParse({ ...ok, password: "short" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...ok, company: "" }).success).toBe(false);
  });
});

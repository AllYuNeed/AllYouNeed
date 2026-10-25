import { describe, test, expect } from "vitest";
import { assertNoPrivilegedKeys, isPrivilegedKey, readSupabaseConfig } from "@/lib/supabase/config";

// A JWT with the given role in its payload (header/signature are irrelevant to the check).
const jwt = (role: string) => {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ iss: "supabase", role, exp: 4102444800 })}.signature`;
};

const URL_OK = "https://abcdefghijklmnop.supabase.co";
const PUBLISHABLE = "sb_publishable_AbCdEf1234567890_xyz";

describe("readSupabaseConfig", () => {
  test("accepts a project URL with a publishable key", () => {
    expect(readSupabaseConfig({ url: URL_OK, key: PUBLISHABLE })).toEqual({ configured: true, url: URL_OK, key: PUBLISHABLE });
  });

  test("accepts the legacy anon JWT", () => {
    const anon = jwt("anon");
    expect(readSupabaseConfig({ url: URL_OK, key: anon })).toEqual({ configured: true, url: URL_OK, key: anon });
  });

  test("trims whitespace and drops a trailing path from the URL", () => {
    expect(readSupabaseConfig({ url: `  ${URL_OK}/rest/v1/  `, key: ` ${PUBLISHABLE} ` })).toEqual({ configured: true, url: URL_OK, key: PUBLISHABLE });
  });

  test("accepts the local CLI over plain http, but only on localhost", () => {
    expect(readSupabaseConfig({ url: "http://127.0.0.1:54321", key: PUBLISHABLE }).configured).toBe(true);
    expect(readSupabaseConfig({ url: "http://localhost:54321", key: PUBLISHABLE }).configured).toBe(true);
    expect(readSupabaseConfig({ url: "http://abcdefghijklmnop.supabase.co", key: PUBLISHABLE })).toEqual({ configured: false, reason: "invalid-url" });
  });

  test("missing values mean not configured (the normal state of a fresh checkout)", () => {
    expect(readSupabaseConfig({})).toEqual({ configured: false, reason: "missing" });
    expect(readSupabaseConfig({ url: URL_OK })).toEqual({ configured: false, reason: "missing" });
    expect(readSupabaseConfig({ key: PUBLISHABLE })).toEqual({ configured: false, reason: "missing" });
    expect(readSupabaseConfig({ url: "   ", key: "   " })).toEqual({ configured: false, reason: "missing" });
  });

  test("the untouched values from .env.example do not count as configured", () => {
    expect(readSupabaseConfig({ url: "https://YOUR-PROJECT-REF.supabase.co", key: PUBLISHABLE })).toEqual({ configured: false, reason: "placeholder" });
    expect(readSupabaseConfig({ url: URL_OK, key: "YOUR_SUPABASE_PUBLISHABLE_KEY" })).toEqual({ configured: false, reason: "placeholder" });
  });

  test("a malformed URL is rejected", () => {
    expect(readSupabaseConfig({ url: "not a url", key: PUBLISHABLE })).toEqual({ configured: false, reason: "invalid-url" });
    expect(readSupabaseConfig({ url: "ftp://x.supabase.co", key: PUBLISHABLE })).toEqual({ configured: false, reason: "invalid-url" });
  });

  test("a key that is neither a publishable key nor a JWT is rejected", () => {
    expect(readSupabaseConfig({ url: URL_OK, key: "hunter2" })).toEqual({ configured: false, reason: "invalid-key" });
  });

  test("REFUSES a secret or service-role key, so it can never be shipped to browsers", () => {
    expect(readSupabaseConfig({ url: URL_OK, key: "sb_secret_AbCdEf1234567890" })).toEqual({ configured: false, reason: "privileged-key" });
    expect(readSupabaseConfig({ url: URL_OK, key: jwt("service_role") })).toEqual({ configured: false, reason: "privileged-key" });
    expect(readSupabaseConfig({ url: URL_OK, key: jwt("supabase_admin") })).toEqual({ configured: false, reason: "privileged-key" });
  });
});

describe("isPrivilegedKey", () => {
  test("recognises secret keys and service-role JWTs, and nothing public", () => {
    expect(isPrivilegedKey("sb_secret_x")).toBe(true);
    expect(isPrivilegedKey(jwt("service_role"))).toBe(true);
    expect(isPrivilegedKey(jwt("anon"))).toBe(false);
    expect(isPrivilegedKey(jwt("authenticated"))).toBe(false);
    expect(isPrivilegedKey(PUBLISHABLE)).toBe(false);
  });

  test("sees a secret even when it is wrapped in the quotes someone pasted around it, or has stray whitespace", () => {
    expect(isPrivilegedKey('"sb_secret_AbCdEf1234567890"')).toBe(true);
    expect(isPrivilegedKey("'sb_secret_AbCdEf1234567890'")).toBe(true);
    expect(isPrivilegedKey("  sb_secret_AbCdEf1234567890\n")).toBe(true);
    expect(isPrivilegedKey(`"${jwt("service_role")}"`)).toBe(true);
    expect(isPrivilegedKey(`"${jwt("anon")}"`)).toBe(false);
  });

  test("survives garbage without throwing", () => {
    expect(isPrivilegedKey("")).toBe(false);
    expect(isPrivilegedKey("a.b.c")).toBe(false);
    expect(isPrivilegedKey("eyJ.!!!.sig")).toBe(false);
  });
});

describe("assertNoPrivilegedKeys (the build-time guard in next.config.ts)", () => {
  // Refusing a secret at runtime is not enough: Next.js inlines every NEXT_PUBLIC_ value into the bundle, so the build must fail.
  test("passes for a normal public configuration, and ignores variables that are not NEXT_PUBLIC_", () => {
    expect(() =>
      assertNoPrivilegedKeys({
        NEXT_PUBLIC_SUPABASE_URL: URL_OK,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: PUBLISHABLE,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: jwt("anon"),
        SUPABASE_SERVICE_ROLE_KEY: jwt("service_role"), // a server-only secret is fine; it is simply never inlined
        PATH: "/usr/bin",
      })
    ).not.toThrow();
    expect(() => assertNoPrivilegedKeys({})).not.toThrow();
  });

  test("throws for a service-role JWT or a secret key in ANY NEXT_PUBLIC_ variable, naming the variable", () => {
    expect(() => assertNoPrivilegedKeys({ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: jwt("service_role") })).toThrow(/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.*service-role/);
    expect(() => assertNoPrivilegedKeys({ NEXT_PUBLIC_SUPABASE_ANON_KEY: "sb_secret_AbCdEf1234567890" })).toThrow(/NEXT_PUBLIC_SUPABASE_ANON_KEY/);
    expect(() => assertNoPrivilegedKeys({ NEXT_PUBLIC_SOMETHING_ELSE: " sb_secret_AbCdEf1234567890 " })).toThrow(/NEXT_PUBLIC_SOMETHING_ELSE/);
  });

  test("throws for a NEXT_PUBLIC_ variable that is named like a secret and has a value (a typo'd copy of the key)", () => {
    expect(() => assertNoPrivilegedKeys({ NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: "anything" })).toThrow(/SERVICE_ROLE/);
    expect(() => assertNoPrivilegedKeys({ NEXT_PUBLIC_SUPABASE_SECRET_KEY: "anything" })).toThrow(/SECRET/);
    expect(() => assertNoPrivilegedKeys({ NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: "" })).not.toThrow(); // empty: nothing to leak
  });

  test("catches a quoted secret too", () => {
    expect(() => assertNoPrivilegedKeys({ NEXT_PUBLIC_SUPABASE_ANON_KEY: '"sb_secret_AbCdEf1234567890"' })).toThrow(/NEXT_PUBLIC_SUPABASE_ANON_KEY/);
  });

  test("the error tells the owner to rotate the key", () => {
    expect(() => assertNoPrivilegedKeys({ NEXT_PUBLIC_X_KEY: jwt("service_role") })).toThrow(/rotate/i);
  });
});

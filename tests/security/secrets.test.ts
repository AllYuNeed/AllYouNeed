// @vitest-environment node
import { describe, test, expect } from "vitest";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const walk = (dir: string): string[] =>
  readdirSync(join(root, dir)).flatMap((name) => {
    const rel = join(dir, name);
    return statSync(join(root, rel)).isDirectory() ? walk(rel) : /\.(tsx?|mjs|css)$/.test(name) ? [rel] : [];
  });

const shipped = ["app", "components", "lib", "content"].flatMap(walk); // everything that can end up in the browser bundle
const text = (file: string) => readFileSync(join(root, file), "utf8");

describe("nothing privileged can reach the browser", () => {
  test("no secret / service-role key name or value appears in shipped code (config.ts only names them to REFUSE them)", () => {
    const offenders = shipped
      .filter((f) => f !== join("lib", "supabase", "config.ts"))
      .filter((f) => /service_role|SERVICE_ROLE|sb_secret_|supabase_admin/.test(text(f)));
    expect(offenders).toEqual([]);
  });

  test("the only environment variables the app reads are the two public Supabase ones", () => {
    const used = new Set<string>();
    for (const f of shipped) for (const m of text(f).matchAll(/process\.env\.([A-Z0-9_]+)/g)) if (!m[1].endsWith("_")) used.add(m[1]); // a trailing _ is `NEXT_PUBLIC_*` in a comment
    expect([...used].sort()).toEqual(["NEXT_PUBLIC_SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SUPABASE_URL"]);
  });

  test("no hard-coded Supabase project URL or JWT/key in shipped code", () => {
    const offenders = shipped.filter((f) => /https:\/\/[a-z0-9]{20}\.supabase\.co|sb_publishable_[A-Za-z0-9_-]{10,}|eyJ[A-Za-z0-9_-]{20,}\./.test(text(f)));
    expect(offenders.map((f) => relative(root, join(root, f)))).toEqual([]);
  });

  test("next.config runs the build-time guard that fails the build when a secret is in a NEXT_PUBLIC_ variable", () => {
    expect(text("next.config.ts")).toMatch(/assertNoPrivilegedKeys\(process\.env\)/);
  });

  test("next.config does not copy server environment variables into the bundle", () => {
    expect(text("next.config.ts")).not.toMatch(/\benv\s*:/);
  });
});

describe(".env.example", () => {
  const example = () => text(".env.example");

  test("exists, documents the two public variables, and holds placeholders rather than real values", () => {
    expect(existsSync(join(root, ".env.example"))).toBe(true);
    expect(example()).toMatch(/^NEXT_PUBLIC_SUPABASE_URL=https:\/\/YOUR-PROJECT-REF\.supabase\.co$/m);
    expect(example()).toMatch(/^NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY$/m);
  });

  test("never asks for a secret key in a NEXT_PUBLIC_ variable", () => {
    const assignments = example().split("\n").filter((l) => /^[A-Z0-9_]+=/.test(l));
    for (const line of assignments) expect(line, line).not.toMatch(/^NEXT_PUBLIC_[A-Z0-9_]*(SECRET|SERVICE)/);
    expect(assignments.join("\n")).not.toMatch(/sb_secret_|eyJ/);
  });

  test("is not ignored by git (the real .env files are)", () => {
    const ignore = text(".gitignore");
    expect(ignore).toMatch(/^\.env\*$/m);
    expect(ignore).toMatch(/^!\.env\.example$/m);
  });
});

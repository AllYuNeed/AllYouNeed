// @vitest-environment node
//
// Runs the real migration SQL on a real Postgres engine (PGlite, in-process) behind a minimal stand-in for what
// Supabase provides: the anon / authenticated / service_role roles, the auth schema, auth.uid() (read from the
// request.jwt.claims setting, as PostgREST sets it) and Supabase's default table privileges for the public schema.
// This proves the SQL, the constraints and the RLS policies. It does NOT prove anything about a hosted project:
// a real Supabase project still needs the checklist in docs/SUPABASE_SETUP.md.
import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { teamSizes } from "@/lib/schemas";

const migrationsDir = join(process.cwd(), "supabase/migrations");
const migrations = readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();
const sql = (file: string) => readFileSync(join(migrationsDir, file), "utf8");

const SUPABASE_STANDIN = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;

  create schema auth;
  create table auth.users (
    id uuid primary key default gen_random_uuid(),
    email text,
    raw_user_meta_data jsonb
  );
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub', '')::uuid
  $$;

  grant usage on schema auth to anon, authenticated, service_role;
  grant execute on function auth.uid() to anon, authenticated, service_role;
  grant usage on schema public to anon, authenticated, service_role;

  -- Supabase grants everything on new public tables to the API roles and relies on RLS; copy that, so the
  -- migration's own revoke/grant lines are what the tests exercise.
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
`;

let db: PGlite;

type Role = "anon" | "authenticated" | "service_role";

/** Run `fn` the way PostgREST would: as `role`, with a JWT whose subject is `sub`. */
async function as<T>(role: Role, sub: string | null, fn: () => Promise<T>): Promise<T> {
  await db.exec(`set role ${role}`);
  await db.query(`select set_config('request.jwt.claims', $1, false)`, [sub ? JSON.stringify({ sub, role }) : ""]);
  try {
    return await fn();
  } finally {
    await db.exec("reset role");
    await db.query(`select set_config('request.jwt.claims', '', false)`);
  }
}

async function createUser(meta: Record<string, unknown> | null, email = `${crypto.randomUUID()}@example.test`) {
  const res = await db.query<{ id: string }>(
    `insert into auth.users (email, raw_user_meta_data) values ($1, $2::jsonb) returning id`,
    [email, meta === null ? null : JSON.stringify(meta)]
  );
  return res.rows[0].id;
}

const validContact = {
  name: "Test Person",
  email: "test.person@example.test",
  phone: "9876543210",
  company: "Test Co",
  team_size: "11-50",
  modules: ["accounting", "tax-filing"],
  message: "Hello",
};

const insertContact = (row: Record<string, unknown>) =>
  db.query(
    `insert into public.contact_requests (name, email, phone, company, team_size, modules, message)
     values ($1, $2, $3, $4, $5, $6::text[], $7)`,
    [row.name, row.email, row.phone, row.company, row.team_size, row.modules, row.message]
  );

beforeAll(async () => {
  db = new PGlite();
  await db.exec(SUPABASE_STANDIN);
  for (const file of migrations) await db.exec(sql(file));
}, 60_000);

afterAll(async () => {
  await db?.close();
});

describe("migration", () => {
  test("is idempotent: running every migration a second time changes nothing and does not fail", async () => {
    for (const file of migrations) await db.exec(sql(file));
  });

  test("row level security is enabled on every public table", async () => {
    const res = await db.query<{ relname: string; relrowsecurity: boolean }>(
      `select c.relname, c.relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relkind = 'r' order by c.relname`
    );
    expect(res.rows.map((r) => r.relname)).toEqual(["contact_requests", "newsletter_subscribers", "profiles"]);
    expect(res.rows.every((r) => r.relrowsecurity)).toBe(true);
  });

  test("the contact table's team-size rule matches lib/schemas.ts", () => {
    const text = migrations.map(sql).join("\n");
    for (const size of teamSizes) expect(text).toContain(`'${size}'`);
  });

  test("no migration references a service-role key or grants anything to the public role", () => {
    const text = migrations.map(sql).join("\n").toLowerCase();
    expect(text).not.toMatch(/service_role_key|sb_secret_/);
    expect(text).not.toMatch(/grant\s+[^;]*\bto\s+public\b/);
  });
});

describe("profiles", () => {
  test("a profile is created automatically for a new user, from sanitised sign-up metadata", async () => {
    const id = await createUser({ full_name: "  Priya Nair  ", company: "Acme Ltd", phone: "9876543210" });
    const row = (await db.query(`select full_name, company, phone from public.profiles where id = $1`, [id])).rows[0];
    expect(row).toEqual({ full_name: "Priya Nair", company: "Acme Ltd", phone: "9876543210" });
  });

  test("bad or missing metadata never blocks sign-up: junk phone is dropped, long text is cut, null metadata works", async () => {
    const junk = await createUser({ full_name: "x".repeat(500), company: "y".repeat(500), phone: "12345" });
    const r1 = (await db.query<{ full_name: string; company: string; phone: string }>(`select * from public.profiles where id = $1`, [junk])).rows[0];
    expect(r1.full_name).toHaveLength(120);
    expect(r1.company).toHaveLength(160);
    expect(r1.phone).toBe("");

    const bare = await createUser(null);
    const r2 = (await db.query(`select full_name, company, phone from public.profiles where id = $1`, [bare])).rows[0];
    expect(r2).toEqual({ full_name: "", company: "", phone: "" });
  });

  test("a user reads only their own profile; anon reads nothing", async () => {
    const a = await createUser({ full_name: "Alice" });
    const b = await createUser({ full_name: "Bob" });
    const seenByA = await as("authenticated", a, () => db.query<{ id: string }>(`select id from public.profiles`));
    expect(seenByA.rows.map((r) => r.id)).toEqual([a]);
    const seenByB = await as("authenticated", b, () => db.query<{ id: string }>(`select id from public.profiles`));
    expect(seenByB.rows.map((r) => r.id)).toEqual([b]);
    await expect(as("anon", null, () => db.query(`select * from public.profiles`))).rejects.toThrow(/permission denied/i);
  });

  test("a user can edit their own details but not someone else's", async () => {
    const a = await createUser({ full_name: "Alice" });
    const b = await createUser({ full_name: "Bob" });

    await as("authenticated", a, () => db.query(`update public.profiles set full_name = 'Alice Updated', company = 'New Co' where id = $1`, [a]));
    const own = (await db.query(`select full_name, company from public.profiles where id = $1`, [a])).rows[0];
    expect(own).toEqual({ full_name: "Alice Updated", company: "New Co" });

    const hit = await as("authenticated", a, () => db.query(`update public.profiles set full_name = 'Hacked' where id = $1`, [b]));
    expect(hit.affectedRows).toBe(0);
    expect((await db.query(`select full_name from public.profiles where id = $1`, [b])).rows[0]).toEqual({ full_name: "Bob" });
  });

  test("updated_at moves on update, and id / created_at cannot be edited at all", async () => {
    const a = await createUser({});
    const before = (await db.query<{ updated_at: string }>(`select updated_at from public.profiles where id = $1`, [a])).rows[0].updated_at;
    await new Promise((r) => setTimeout(r, 15));
    await as("authenticated", a, () => db.query(`update public.profiles set company = 'Moved' where id = $1`, [a]));
    const after = (await db.query<{ updated_at: string }>(`select updated_at from public.profiles where id = $1`, [a])).rows[0].updated_at;
    expect(new Date(after).getTime()).toBeGreaterThan(new Date(before).getTime());

    await expect(as("authenticated", a, () => db.query(`update public.profiles set id = gen_random_uuid() where id = $1`, [a]))).rejects.toThrow(/permission denied/i);
    await expect(as("authenticated", a, () => db.query(`update public.profiles set created_at = now() where id = $1`, [a]))).rejects.toThrow(/permission denied/i);
  });

  test("the API cannot insert or delete profiles, and bad values are rejected by constraints", async () => {
    const a = await createUser({});
    await expect(as("authenticated", a, () => db.query(`insert into public.profiles (id) values (gen_random_uuid())`))).rejects.toThrow(/permission denied/i);
    await expect(as("authenticated", a, () => db.query(`delete from public.profiles where id = $1`, [a]))).rejects.toThrow(/permission denied/i);
    await expect(as("authenticated", a, () => db.query(`update public.profiles set phone = '12345' where id = $1`, [a]))).rejects.toThrow(/phone/i);
  });

  test("deleting the auth user removes the profile", async () => {
    const a = await createUser({ full_name: "Gone" });
    await db.query(`delete from auth.users where id = $1`, [a]);
    expect((await db.query(`select 1 from public.profiles where id = $1`, [a])).rows).toHaveLength(0);
  });

  test("the sign-up trigger function cannot be called from the API", async () => {
    await expect(as("anon", null, () => db.query(`select public.handle_new_user()`))).rejects.toThrow(/permission denied/i);
    await expect(as("authenticated", crypto.randomUUID(), () => db.query(`select public.handle_new_user()`))).rejects.toThrow(/permission denied/i);
  });
});

describe("contact_requests", () => {
  test("anyone can submit; the row is stored with status 'new' and no user", async () => {
    await as("anon", null, () => insertContact({ ...validContact, email: "anon@example.test" }));
    const row = (await db.query(`select status, user_id, team_size, modules from public.contact_requests where email = 'anon@example.test'`)).rows[0];
    expect(row).toEqual({ status: "new", user_id: null, team_size: "11-50", modules: ["accounting", "tax-filing"] });
  });

  test("a signed-in visitor's request is linked to them automatically", async () => {
    const u = await createUser({});
    await as("authenticated", u, () => insertContact({ ...validContact, email: "linked@example.test" }));
    const row = (await db.query<{ user_id: string }>(`select user_id from public.contact_requests where email = 'linked@example.test'`)).rows[0];
    expect(row.user_id).toBe(u);
  });

  test("nobody can read, edit or delete requests through the API", async () => {
    const u = await createUser({});
    for (const [role, sub] of [["anon", null], ["authenticated", u]] as const) {
      await expect(as(role, sub, () => db.query(`select * from public.contact_requests`))).rejects.toThrow(/permission denied/i);
      await expect(as(role, sub, () => db.query(`update public.contact_requests set status = 'closed'`))).rejects.toThrow(/permission denied/i);
      await expect(as(role, sub, () => db.query(`delete from public.contact_requests`))).rejects.toThrow(/permission denied/i);
    }
  });

  test("the client cannot pick user_id, status or id", async () => {
    const u = await createUser({});
    await expect(as("anon", null, () => db.query(`insert into public.contact_requests (name, email, phone, company, team_size, modules, user_id) values ('a','a@b.co','9876543210','c','1-10','{hr}', $1)`, [u]))).rejects.toThrow(/permission denied/i);
    await expect(as("anon", null, () => db.query(`insert into public.contact_requests (name, email, phone, company, team_size, modules, status) values ('a','a@b.co','9876543210','c','1-10','{hr}','closed')`))).rejects.toThrow(/permission denied/i);
  });

  test("the service role keeps full access even where the project does not auto-grant new tables", async () => {
    // Re-run on a database whose default privileges grant nothing, as newer Supabase projects may.
    const bare = new PGlite();
    await bare.exec(SUPABASE_STANDIN.replace(/alter default privileges[^;]+;/g, ""));
    for (const file of migrations) await bare.exec(sql(file));
    await bare.exec("set role service_role");
    for (const t of ["profiles", "contact_requests", "newsletter_subscribers"]) await bare.query(`select count(*) from public.${t}`);
    await bare.query("select public.subscribe_to_newsletter('svc@example.test')");
    await bare.exec("reset role");
    await bare.close();
  });

  test("the service role (dashboard / server) can read requests", async () => {
    const rows = await as("service_role", null, () => db.query(`select count(*)::int as n from public.contact_requests`));
    expect((rows.rows[0] as { n: number }).n).toBeGreaterThan(0);
  });

  test.each([
    ["empty name", { name: "   " }],
    ["bad email", { email: "not-an-email" }],
    ["email with a space", { email: "a b@example.test" }],
    ["short phone", { phone: "12345" }],
    ["phone starting with 5", { phone: "5876543210" }],
    ["unknown team size", { team_size: "9999" }],
    ["no modules", { modules: [] }],
    ["module slug with capitals", { modules: ["HR"] }],
    ["module slug with a comma", { modules: ["hr,payroll;drop"] }],
    ["a NULL element among the modules", { modules: [null, "hr"] }],
    ["too many modules", { modules: Array.from({ length: 21 }, (_, i) => `m${i}`) }],
    ["overlong message", { message: "x".repeat(2001) }],
    ["overlong name", { name: "x".repeat(121) }],
  ])("rejects %s", async (_label, patch) => {
    await expect(as("anon", null, () => insertContact({ ...validContact, ...patch }))).rejects.toThrow(/violates check constraint|invalid input/i);
  });
});

describe("newsletter_subscribers", () => {
  const subscribe = (email: string, whatsapp = "") => db.query(`select public.subscribe_to_newsletter($1, $2)`, [email, whatsapp]);

  test("anyone can subscribe, an address is stored lower-cased, and subscribing twice is silently ignored", async () => {
    await as("anon", null, () => subscribe("News@Example.test", "9876543210"));
    await as("anon", null, () => subscribe("news@example.test"));
    await as("authenticated", crypto.randomUUID(), () => subscribe("  NEWS@example.test  "));
    const rows = (await db.query(`select email, whatsapp from public.newsletter_subscribers where email = 'news@example.test'`)).rows;
    expect(rows).toEqual([{ email: "news@example.test", whatsapp: "9876543210" }]);
  });

  test("the table itself is closed to the API: no read, no direct insert, no edit, no delete", async () => {
    const u = crypto.randomUUID();
    for (const [role, sub] of [["anon", null], ["authenticated", u]] as const) {
      await expect(as(role, sub, () => db.query(`select * from public.newsletter_subscribers`))).rejects.toThrow(/permission denied/i);
      await expect(as(role, sub, () => db.query(`insert into public.newsletter_subscribers (email) values ('direct@example.test')`))).rejects.toThrow(/permission denied/i);
      await expect(as(role, sub, () => db.query(`delete from public.newsletter_subscribers`))).rejects.toThrow(/permission denied/i);
    }
  });

  test("rejects a malformed email, an empty email and a bad WhatsApp number", async () => {
    await expect(as("anon", null, () => subscribe("nope"))).rejects.toThrow(/violates check constraint/i);
    await expect(as("anon", null, () => subscribe(""))).rejects.toThrow(/violates check constraint/i);
    await expect(as("anon", null, () => subscribe("ok@example.test", "123"))).rejects.toThrow(/violates check constraint/i);
  });

  test("the function is not callable without an execute grant (public is revoked)", async () => {
    await db.exec("create role nobody nologin; grant usage on schema public to nobody;");
    await db.exec("set role nobody");
    try {
      await expect(db.query(`select public.subscribe_to_newsletter('x@example.test')`)).rejects.toThrow(/permission denied/i);
    } finally {
      await db.exec("reset role");
    }
  });
});

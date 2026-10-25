import { vi } from "vitest";

type AuthError = { code?: string; message?: string; name?: string; status?: number };
type Result = { data?: unknown; error?: AuthError | null };

/** A chainable stand-in for `supabase.from(table)...` that records what was asked and answers with `result`. */
function queryBuilder(result: Result) {
  const b: Record<string, unknown> = {};
  for (const name of ["select", "update", "insert", "eq"]) b[name] = vi.fn(() => b);
  b.maybeSingle = vi.fn(async () => ({ data: null, error: null, ...result }));
  // `await supabase.from("t").insert(row)` awaits the builder itself.
  b.then = (resolve: (v: unknown) => unknown) => resolve({ data: null, error: null, ...result });
  return b as Record<string, ReturnType<typeof vi.fn>> & { then: unknown };
}

const ok = async (): Promise<Result> => ({ data: {}, error: null });

/**
 * Just enough of the supabase-js client for the components under test. Every method is a vi.fn() so a test can
 * assert exactly what the browser would have sent. Override a method's result with e.g.
 * `fake.auth.signInWithPassword.mockResolvedValueOnce({ data: {}, error: { code: "invalid_credentials" } })`.
 */
export function fakeSupabase(tables: Record<string, Result> = {}) {
  const builders: Record<string, ReturnType<typeof queryBuilder>> = {};
  const auth = {
    signInWithPassword: vi.fn<(credentials: unknown) => Promise<Result>>(ok),
    signUp: vi.fn<(credentials: unknown) => Promise<Result>>(async () => ({ data: { user: {}, session: null }, error: null })),
    resetPasswordForEmail: vi.fn<(email: string, options?: unknown) => Promise<Result>>(ok),
    updateUser: vi.fn<(attributes: unknown) => Promise<Result>>(ok),
    signOut: vi.fn<(options?: unknown) => Promise<{ error: AuthError | null }>>(async () => ({ error: null })),
    onAuthStateChange: vi.fn<(callback: unknown) => unknown>(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  };
  const rpc = vi.fn<(fn: string, args: unknown) => Promise<Result>>(ok);
  const from = vi.fn((table: string) => (builders[table] = queryBuilder(tables[table] ?? {})));
  return { auth, rpc, from, builders };
}

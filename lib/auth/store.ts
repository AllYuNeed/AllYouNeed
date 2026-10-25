import type { Session, User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type AuthStatus = "loading" | "signed-in" | "signed-out" | "unconfigured";

export type AuthState = {
  status: AuthStatus;
  user: User | null;
  /** True once the visitor arrived through a password-recovery email link (they may now choose a new password). */
  recovery: boolean;
};

/**
 * What the server renders and what the browser renders while hydrating: "unconfigured" when this build has no
 * Supabase settings (the same on both sides, because the settings are inlined at build time), otherwise "loading".
 */
const INITIAL: AuthState = { status: isSupabaseConfigured ? "loading" : "unconfigured", user: null, recovery: false };

let state: AuthState = INITIAL;
let started = false;
const listeners = new Set<() => void>();

function emit(next: AuthState) {
  state = next;
  for (const l of listeners) l();
}

function fromSession(event: string, session: Session | null): AuthState {
  if (!session) return { status: "signed-out", user: null, recovery: false };
  const recovery = event === "PASSWORD_RECOVERY" || state.recovery;
  // Token refreshes hand over a fresh session object every hour; don't re-render the app for an identical user.
  const same = state.status === "signed-in" && state.user?.id === session.user.id && state.user.updated_at === session.user.updated_at;
  if (same && state.recovery === recovery) return state;
  return { status: "signed-in", user: session.user, recovery };
}

/** Subscribe to Supabase's auth events (once, on first use). Never call Supabase from inside the callback. */
function start() {
  if (started) return;
  started = true;
  const supabase = getSupabase();
  if (!supabase) return;
  // Fires INITIAL_SESSION right away with whatever session is stored (and, on /auth/callback, after the
  // `?code=` in the URL has been exchanged for one), then SIGNED_IN / SIGNED_OUT / TOKEN_REFRESHED /
  // PASSWORD_RECOVERY / USER_UPDATED as they happen, including from other tabs.
  supabase.auth.onAuthStateChange((event, session) => {
    const next = fromSession(event, session);
    if (next !== state) emit(next);
  });
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  start();
  return () => {
    listeners.delete(listener);
  };
}

export const getSnapshot = () => state;
export const getServerSnapshot = () => INITIAL;

/** Log out of THIS browser only (other devices stay signed in). */
export async function signOut(): Promise<{ ok: true } | { ok: false }> {
  const supabase = getSupabase();
  if (!supabase) return { ok: true };
  const { error } = await supabase.auth.signOut({ scope: "local" });
  return error ? { ok: false } : { ok: true };
}

/** Test hook: forget everything, as if the page had just loaded. */
export function __resetAuthStoreForTests(initial: AuthState = INITIAL) {
  state = initial;
  started = false;
  listeners.clear();
}

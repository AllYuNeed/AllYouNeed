import { describe, test, expect, vi, beforeEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import type { Session } from "@supabase/supabase-js";

const h = vi.hoisted(() => ({
  client: null as null | { auth: { onAuthStateChange: ReturnType<typeof vi.fn>; signOut: ReturnType<typeof vi.fn> } },
}));
vi.mock("@/lib/supabase/client", () => ({ getSupabase: () => h.client }));

import { __resetAuthStoreForTests, getServerSnapshot, getSnapshot, signOut, subscribe } from "@/lib/auth/store";
import { useAuth } from "@/lib/auth/useAuth";

type Cb = (event: string, session: Session | null) => void;
let emit: Cb;
let onAuthStateChange: ReturnType<typeof vi.fn>;

const session = (id = "user-1", updated_at = "2026-10-25T00:00:00Z") => ({ user: { id, email: `${id}@example.test`, updated_at } }) as unknown as Session;

beforeEach(() => {
  onAuthStateChange = vi.fn((cb: Cb) => {
    emit = cb;
    return { data: { subscription: { unsubscribe: vi.fn() } } };
  });
  h.client = { auth: { onAuthStateChange, signOut: vi.fn(async () => ({ error: null })) } };
  __resetAuthStoreForTests({ status: "loading", user: null, recovery: false });
});

describe("auth store", () => {
  test("starts in 'loading' and subscribes to Supabase exactly once, however many components listen", () => {
    const off1 = subscribe(() => {});
    const off2 = subscribe(() => {});
    expect(getSnapshot().status).toBe("loading");
    expect(onAuthStateChange).toHaveBeenCalledTimes(1);
    off1();
    off2();
  });

  test("the stored session arrives as INITIAL_SESSION: a session means signed-in, none means signed-out", () => {
    const seen: string[] = [];
    subscribe(() => seen.push(getSnapshot().status));
    act(() => emit("INITIAL_SESSION", session("a")));
    expect(getSnapshot()).toMatchObject({ status: "signed-in", recovery: false, user: { id: "a" } });
    act(() => emit("SIGNED_OUT", null));
    expect(getSnapshot()).toMatchObject({ status: "signed-out", user: null });
    expect(seen).toEqual(["signed-in", "signed-out"]);
  });

  test("a password-recovery link is remembered, even though INITIAL_SESSION follows it, until sign-out", () => {
    subscribe(() => {});
    act(() => emit("PASSWORD_RECOVERY", session("a")));
    expect(getSnapshot().recovery).toBe(true);
    act(() => emit("INITIAL_SESSION", session("a")));
    expect(getSnapshot()).toMatchObject({ status: "signed-in", recovery: true });
    act(() => emit("SIGNED_OUT", null));
    expect(getSnapshot()).toMatchObject({ status: "signed-out", recovery: false });
  });

  test("a token refresh for the same user does not produce a new state (no re-render of the whole app)", () => {
    const listener = vi.fn();
    subscribe(listener);
    act(() => emit("SIGNED_IN", session("a", "t1")));
    const first = getSnapshot();
    listener.mockClear();
    act(() => emit("TOKEN_REFRESHED", session("a", "t1")));
    expect(getSnapshot()).toBe(first);
    expect(listener).not.toHaveBeenCalled();
    act(() => emit("USER_UPDATED", session("a", "t2"))); // the profile changed: that must get through
    expect(getSnapshot()).not.toBe(first);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test("a different user replaces the previous one", () => {
    subscribe(() => {});
    act(() => emit("SIGNED_IN", session("a")));
    act(() => emit("SIGNED_IN", session("b")));
    expect(getSnapshot().user?.id).toBe("b");
  });

  test("unsubscribed listeners are not called", () => {
    const listener = vi.fn();
    const off = subscribe(listener);
    off();
    act(() => emit("SIGNED_IN", session("a")));
    expect(listener).not.toHaveBeenCalled();
  });

  test("without Supabase settings the state stays 'unconfigured' and nothing is subscribed", () => {
    h.client = null;
    __resetAuthStoreForTests({ status: "unconfigured", user: null, recovery: false });
    subscribe(() => {});
    expect(getSnapshot().status).toBe("unconfigured");
    expect(onAuthStateChange).not.toHaveBeenCalled();
  });

  test("the server snapshot never claims a session", () => {
    expect(getServerSnapshot().user).toBeNull();
    expect(["loading", "unconfigured"]).toContain(getServerSnapshot().status);
  });
});

describe("signOut", () => {
  test("logs out of this browser only", async () => {
    await expect(signOut()).resolves.toEqual({ ok: true });
    expect(h.client!.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  test("reports a failure instead of pretending, and is a no-op without Supabase", async () => {
    h.client!.auth.signOut.mockResolvedValueOnce({ error: { message: "boom" } });
    await expect(signOut()).resolves.toEqual({ ok: false });
    h.client = null;
    await expect(signOut()).resolves.toEqual({ ok: true });
  });
});

describe("useAuth", () => {
  function Probe() {
    const { status, user } = useAuth();
    return <p>{status}:{user?.email ?? "nobody"}</p>;
  }

  test("re-renders its components when the session changes", () => {
    render(<Probe />);
    expect(screen.getByText("loading:nobody")).toBeInTheDocument();
    act(() => emit("SIGNED_IN", session("a")));
    expect(screen.getByText("signed-in:a@example.test")).toBeInTheDocument();
    act(() => emit("SIGNED_OUT", null));
    expect(screen.getByText("signed-out:nobody")).toBeInTheDocument();
  });
});

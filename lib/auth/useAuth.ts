"use client";

import { useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, signOut, subscribe } from "./store";

/**
 * The visitor's sign-in state, shared by every component on the page.
 *   loading       - still reading the stored session (render a neutral placeholder)
 *   signed-in     - `user` is set
 *   signed-out    - show the login / register calls to action
 *   unconfigured  - this build has no Supabase settings: auth is unavailable (see docs/SUPABASE_SETUP.md)
 */
export function useAuth() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { ...state, signOut };
}

"use client";

import { useAuth } from "@/lib/auth/useAuth";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AccountPanel } from "./AccountPanel";

export function AccountPage() {
  const { user } = useAuth();
  return <RequireAuth>{user ? <AccountPanel user={user} /> : null}</RequireAuth>;
}

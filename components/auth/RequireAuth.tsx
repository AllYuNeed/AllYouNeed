"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "@/lib/auth/useAuth";
import { AuthUnavailable } from "./AuthUnavailable";

/**
 * Shows its children only to a signed-in visitor; everyone else is sent to /login/ and returns here afterwards.
 *
 * This is a convenience, not a lock. The site is a static export, so the page itself is a public file that anyone
 * can download. What protects the data is Row Level Security in the database (supabase/migrations): a visitor with
 * no session cannot read anything this page would show. Never put private content in the page source.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "signed-out") router.replace(`/login/?next=${encodeURIComponent(pathname)}`);
  }, [status, pathname, router]);

  if (status === "signed-in") return <>{children}</>;
  if (status === "unconfigured") return <AuthUnavailable />;

  // "loading" (reading the stored session) and "signed-out" (redirecting to /login/) look the same.
  return (
    <p role="status" className="flex items-center gap-2 py-10 text-text-muted">
      <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> Checking your session…
    </p>
  );
}

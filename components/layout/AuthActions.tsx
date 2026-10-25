"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/useAuth";
import { Button } from "@/components/ui/Button";
import { MagneticButton } from "@/components/motion/MagneticButton";

/**
 * The header's account controls. Signed-out, still-loading and not-configured all show Log in / Start free (so the
 * prerendered page, and visitors without JavaScript, get the normal calls to action); signed-in swaps them for
 * Account / Log out.
 */
export function AuthActions() {
  const { status, signOut } = useAuth();

  if (status === "signed-in") {
    return (
      <>
        <Link href="/account/" className="link-underline hidden px-2 text-sm font-medium text-text-muted hover:text-text sm:inline-block">
          Account
        </Link>
        <Button variant="outline" size="sm" onClick={() => void signOut()} className="hidden sm:inline-flex">
          Log out
        </Button>
      </>
    );
  }

  return (
    <>
      <Link href="/login/" className="link-underline hidden px-2 text-sm font-medium text-text-muted hover:text-text sm:inline-block">
        Log in
      </Link>
      <MagneticButton className="hidden sm:block">
        <Button href="/register/" size="sm" arrow>Start free</Button>
      </MagneticButton>
    </>
  );
}

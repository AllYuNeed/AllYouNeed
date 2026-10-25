"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "@/lib/auth/useAuth";
import { readAuthError } from "@/lib/auth/callbackUrl";
import { useMounted } from "@/lib/useMounted";
import { Button } from "@/components/ui/Button";
import { FormStatus } from "@/components/forms/FormStatus";
import { AuthUnavailable } from "./AuthUnavailable";

function Working() {
  return (
    <p role="status" className="flex items-center gap-2 text-text-muted">
      <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> Checking your link…
    </p>
  );
}

function Problem({ message }: { message: string }) {
  return (
    <div className="space-y-4">
      <FormStatus state="error" error={message} successTitle="" />
      <div className="flex flex-wrap gap-3">
        <Button href="/login/" variant="outline">Log in</Button>
        <Button href="/forgot-password/" variant="outline">Reset password</Button>
      </div>
    </div>
  );
}

function CallbackInner() {
  const router = useRouter();
  const { status, recovery } = useAuth();
  // Captured once, on the first client render: supabase-js tidies the URL after it has used the code.
  const [urlError] = useState(() => readAuthError(window.location.search, window.location.hash));

  // supabase-js exchanges the one-time `?code=` in this page's URL for a session as soon as it starts; the auth
  // store then reports "signed-in" (and `recovery` for a password-reset link). Send the visitor on from there.
  useEffect(() => {
    if (urlError) return; // the link failed: say so, even if the visitor happens to be signed in already
    if (status === "signed-in") router.replace(recovery ? "/reset-password/" : "/account/");
  }, [urlError, status, recovery, router]);

  if (urlError) return <Problem message={urlError} />;
  if (status === "unconfigured") return <AuthUnavailable />;
  if (status === "signed-out") {
    return (
      <Problem message="We couldn't sign you in from this link. It may have expired, been used already, or been opened in a different browser from the one you signed up in. If you just confirmed your email, try logging in." />
    );
  }
  return <Working />;
}

/** Landing page for every link Supabase emails (confirm your email, reset your password). */
export function AuthCallback() {
  // Reading window.location during the hydration render would not match the server HTML, so wait until mounted.
  const mounted = useMounted();
  return mounted ? <CallbackInner /> : <Working />;
}

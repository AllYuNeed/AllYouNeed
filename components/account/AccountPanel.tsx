"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/useAuth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormStatus } from "@/components/forms/FormStatus";
import { ProfileForm, type Profile } from "./ProfileForm";

type Loaded = { kind: "loading" } | { kind: "ready"; profile: Profile } | { kind: "error"; message: string };

/** Loads the signed-in user's profile row, then shows the edit form. */
function ProfileCard({ userId }: { userId: string }) {
  const [loaded, setLoaded] = useState<Loaded>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = getSupabase();
      if (!supabase) return;
      const { data, error } = await supabase.from("profiles").select("full_name, company, phone").eq("id", userId).maybeSingle();
      if (cancelled) return;
      if (error) setLoaded({ kind: "error", message: "We couldn't load your details. Please refresh the page." });
      else if (!data) setLoaded({ kind: "error", message: "We couldn't find your profile yet. Log out and back in; if it persists, contact us." });
      else setLoaded({ kind: "ready", profile: data });
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loaded.kind === "loading") {
    return (
      <p role="status" className="flex items-center gap-2 text-text-muted">
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> Loading your details…
      </p>
    );
  }
  if (loaded.kind === "error") return <FormStatus state="error" error={loaded.message} successTitle="" />;
  return <ProfileForm userId={userId} initial={loaded.profile} />;
}

export function AccountPanel({ user }: { user: User }) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const logOut = async () => {
    setSigningOut(true);
    await signOut();
    router.replace("/");
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-display text-lg font-bold text-text">Signed in as</h2>
        <p className="mt-1 break-all text-text">{user.email}</p>
        {!user.email_confirmed_at ? <p className="mt-1 text-sm text-text-muted">Your email address isn&apos;t confirmed yet.</p> : null}
        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="outline" onClick={logOut} disabled={signingOut}>{signingOut ? "Logging out…" : "Log out"}</Button>
          <Button href="/reset-password/" variant="ghost">Change password</Button>
        </div>
      </Card>
      <Card>
        <h2 className="font-display text-lg font-bold text-text">Your details</h2>
        <div className="mt-5">
          <ProfileCard userId={user.id} />
        </div>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { profileSchema, type ProfileInput, type ProfileOutput } from "@/lib/schemas";
import { getSupabase } from "@/lib/supabase/client";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormStatus, type FormState } from "@/components/forms/FormStatus";

export type Profile = { full_name: string; company: string; phone: string };

/** Edit the signed-in user's own profile row. Row Level Security is what stops it touching anyone else's. */
export function ProfileForm({ userId, initial }: { userId: string; initial: Profile }) {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string>();
  const { register, handleSubmit, formState, reset } = useForm<ProfileInput, unknown, ProfileOutput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: initial.full_name, company: initial.company, phone: initial.phone },
  });

  const onSubmit = handleSubmit(async ({ fullName, company, phone }) => {
    const supabase = getSupabase();
    if (!supabase) {
      setError("Accounts aren't switched on for this site yet.");
      setState("error");
      return;
    }
    setState("submitting");
    const { data, error: dbError } = await supabase
      .from("profiles")
      .update({ full_name: fullName, company, phone })
      .eq("id", userId)
      .select("full_name, company, phone")
      .maybeSingle();
    if (dbError || !data) {
      // No row means RLS matched nothing: the profile is missing (see docs/SUPABASE_SETUP.md, "Existing users").
      setError(dbError ? "We couldn't save your details. Please try again." : "We couldn't find your profile to update. Log out and back in; if it persists, contact us.");
      setState("error");
      return;
    }
    reset({ fullName: data.full_name, company: data.company, phone: data.phone });
    setState("success");
  });

  const busy = state === "submitting";
  const e = formState.errors;
  return (
    <form method="post" onSubmit={onSubmit} noValidate aria-label="Your details" className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="profile-name" label="Full name" error={e.fullName?.message}>
          <Input autoComplete="name" disabled={busy} {...register("fullName")} />
        </Field>
        <Field id="profile-company" label="Company" error={e.company?.message}>
          <Input autoComplete="organization" disabled={busy} {...register("company")} />
        </Field>
      </div>
      <Field id="profile-phone" label="Phone" error={e.phone?.message} hint="10-digit Indian mobile, +91 optional">
        <Input type="tel" inputMode="numeric" autoComplete="tel" disabled={busy} {...register("phone")} />
      </Field>
      <FormStatus state={state} error={error} successTitle="Details saved." onRetry={() => setState("idle")} />
      <Button type="submit" disabled={busy}>
        {busy ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
        {busy ? "Saving…" : "Save details"}
      </Button>
    </form>
  );
}

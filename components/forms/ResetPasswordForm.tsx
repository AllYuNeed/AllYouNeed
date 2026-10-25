"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { resetPasswordSchema, type ResetPasswordInput, type ResetPasswordOutput } from "@/lib/schemas";
import { getSupabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/useAuth";
import { friendlyAuthError } from "@/lib/auth/errors";
import { useMounted } from "@/lib/useMounted";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { AuthUnavailable } from "@/components/auth/AuthUnavailable";
import { FormStatus, type FormState } from "./FormStatus";
import { PasswordInput } from "./PasswordInput";

/**
 * Choose a new password. Two ways in:
 *   - from a reset email (the callback page already signed them in): no current password exists to ask for;
 *   - already signed in and just changing it: the CURRENT password is required first, so someone at an unattended
 *     laptop (or a stolen session) cannot lock the owner out. Supabase itself would allow the change without it.
 * Without a session there is nothing to update, so the visitor is pointed at /forgot-password/.
 */
export function ResetPasswordForm() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string>();
  const mounted = useMounted();
  const { status, recovery, user } = useAuth();
  const needsCurrent = !recovery;
  const { register, handleSubmit, formState, setError: setFieldError } = useForm<ResetPasswordInput, unknown, ResetPasswordOutput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { current: "", password: "", confirm: "" },
  });

  const onSubmit = handleSubmit(async ({ current, password }) => {
    const supabase = getSupabase();
    if (!supabase) {
      setError("Accounts aren't switched on for this site yet.");
      setState("error");
      return;
    }
    if (needsCurrent) {
      if (!current) {
        setFieldError("current", { message: "Enter your current password" });
        return;
      }
      if (!user?.email) {
        setError("Please log in again to change your password.");
        setState("error");
        return;
      }
      setState("submitting");
      // Prove the visitor knows the current password before changing it.
      const { error: reauthError } = await supabase.auth.signInWithPassword({ email: user.email, password: current });
      if (reauthError) {
        setFieldError("current", { message: reauthError.code === "invalid_credentials" ? "That isn't your current password." : friendlyAuthError(reauthError) });
        setState("idle");
        return;
      }
    }
    setState("submitting");
    const { error: authError } = await supabase.auth.updateUser({ password });
    if (authError) {
      setError(friendlyAuthError(authError));
      setState("error");
      return;
    }
    setState("success");
  });

  if (status === "unconfigured") return <AuthUnavailable />;

  if (status === "signed-out") {
    return (
      <div className="space-y-4">
        <FormStatus state="error" error="This link has expired or was already used. Request a new one to choose a password." successTitle="" />
        <Button href="/forgot-password/" size="lg" className="w-full">Request a new link</Button>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="space-y-4">
        <FormStatus state="success" successTitle="Your password has been changed." successBody="Use it the next time you log in." />
        <Button href="/account/" size="lg" className="w-full">Go to your account</Button>
      </div>
    );
  }

  const busy = state === "submitting";
  const e = formState.errors;
  return (
    <form method="post" onSubmit={onSubmit} noValidate aria-label="Choose a new password" className="space-y-5">
      {needsCurrent ? (
        <Field id="reset-current" label="Current password" required error={e.current?.message}>
          <PasswordInput autoComplete="current-password" placeholder="••••••••" disabled={busy} {...register("current")} />
        </Field>
      ) : null}
      <Field id="reset-password" label="New password" required error={e.password?.message} hint="At least 8 characters">
        <PasswordInput autoComplete="new-password" placeholder="••••••••" disabled={busy} {...register("password")} />
      </Field>
      <Field id="reset-confirm" label="Repeat new password" required error={e.confirm?.message}>
        <PasswordInput autoComplete="new-password" placeholder="••••••••" disabled={busy} {...register("confirm")} />
      </Field>
      <FormStatus state={state} error={error} successTitle="" onRetry={() => setState("idle")} />
      <Button type="submit" size="lg" disabled={busy || !mounted || status !== "signed-in"} className="w-full">
        {busy ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
        {busy ? "Saving…" : "Save new password"}
      </Button>
      <p className="text-center text-sm text-text-muted">
        <Link href="/account/" className="link-underline">Back to your account</Link>
      </p>
    </form>
  );
}

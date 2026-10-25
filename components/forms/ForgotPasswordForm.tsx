"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { forgotPasswordSchema, type ForgotPasswordInput, type ForgotPasswordOutput } from "@/lib/schemas";
import { getSupabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/useAuth";
import { friendlyAuthError } from "@/lib/auth/errors";
import { useMounted } from "@/lib/useMounted";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthUnavailable } from "@/components/auth/AuthUnavailable";
import { FormStatus, type FormState } from "./FormStatus";

export function ForgotPasswordForm() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string>();
  const mounted = useMounted();
  const { status } = useAuth();
  const unavailable = status === "unconfigured";
  const { register, handleSubmit, formState } = useForm<ForgotPasswordInput, unknown, ForgotPasswordOutput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    const supabase = getSupabase();
    if (!supabase) {
      setError("Accounts aren't switched on for this site yet.");
      setState("error");
      return;
    }
    setState("submitting");
    // The link in the email returns to /auth/callback/, which signs the visitor in and forwards them to /reset-password/.
    // This exact URL must be in Supabase's Redirect URLs allow-list.
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback/` });
    if (authError) {
      setError(friendlyAuthError(authError));
      setState("error");
      return;
    }
    setState("success");
  });

  if (state === "success") {
    // Same words whether or not the address has an account, so this form can't be used to find out who does.
    return (
      <FormStatus
        state="success"
        successTitle="Check your email."
        successBody="If an account exists for that address, we've sent a link to choose a new password. It can take a few minutes to arrive."
      />
    );
  }

  const busy = state === "submitting";
  return (
    <form method="post" onSubmit={onSubmit} noValidate aria-label="Reset your password" className="space-y-5">
      {unavailable ? <AuthUnavailable /> : null}
      <Field id="forgot-email" label="Work email" required error={formState.errors.email?.message}>
        <Input type="email" autoComplete="email" placeholder="you@company.in" disabled={busy} {...register("email")} />
      </Field>
      <FormStatus state={state} error={error} successTitle="" onRetry={() => setState("idle")} />
      <Button type="submit" size="lg" disabled={busy || !mounted || unavailable} className="w-full">
        {busy ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
        {busy ? "Sending…" : "Send reset link"}
      </Button>
      <p className="text-center text-sm text-text-muted">
        Remembered it? <Link href="/login/" className="link-underline font-medium text-primary">Log in</Link>
      </p>
    </form>
  );
}

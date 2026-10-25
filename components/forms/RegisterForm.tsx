"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { registerSchema, type RegisterInput, type RegisterOutput } from "@/lib/schemas";
import { getSupabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/useAuth";
import { friendlyAuthError } from "@/lib/auth/errors";
import { useMounted } from "@/lib/useMounted";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthUnavailable } from "@/components/auth/AuthUnavailable";
import { FormStatus, type FormState } from "./FormStatus";
import { PasswordInput } from "./PasswordInput";

export function RegisterForm() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string>();
  // What the success message says: "confirm" = a confirmation email is on its way; "signed-in" = confirmation is off.
  const [outcome, setOutcome] = useState<{ kind: "confirm"; email: string } | { kind: "signed-in" }>();
  const router = useRouter();
  const mounted = useMounted();
  const { status } = useAuth();
  const unavailable = status === "unconfigured";
  const { register, handleSubmit, formState } = useForm<RegisterInput, unknown, RegisterOutput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", company: "", password: "" },
  });

  const onSubmit = handleSubmit(async ({ name, email, phone, company, password }) => {
    const supabase = getSupabase();
    if (!supabase) {
      setError("Accounts aren't switched on for this site yet.");
      setState("error");
      return;
    }
    setState("submitting");
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Becomes raw_user_meta_data; the database trigger copies it into the profiles table (sanitised).
        data: { full_name: name, company, phone },
        // Where the confirmation link lands. This exact URL must be in Supabase's Redirect URLs allow-list.
        emailRedirectTo: `${window.location.origin}/auth/callback/`,
      },
    });
    if (authError) {
      setError(friendlyAuthError(authError));
      setState("error");
      return;
    }
    setState("success");
    if (data.session) {
      // Email confirmation is switched off in Supabase, so the visitor is already signed in.
      setOutcome({ kind: "signed-in" });
      router.replace("/account/");
    } else {
      setOutcome({ kind: "confirm", email });
    }
  });

  if (state === "success") {
    return outcome?.kind === "signed-in" ? (
      <FormStatus state="success" successTitle="Your account is ready." successBody="Taking you to your account…" />
    ) : (
      <FormStatus
        state="success"
        successTitle="Check your email to confirm your account."
        successBody={`We sent a confirmation link to ${outcome?.email ?? "your inbox"}. If you already have an account with that address, log in or reset your password instead.`}
      />
    );
  }

  const busy = state === "submitting";
  const e = formState.errors;
  return (
    <form method="post" onSubmit={onSubmit} noValidate aria-label="Create account" className="space-y-5">
      {unavailable ? <AuthUnavailable /> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="reg-name" label="Full name" required error={e.name?.message}>
          <Input autoComplete="name" placeholder="Your full name" disabled={busy} {...register("name")} />
        </Field>
        <Field id="reg-company" label="Company" required error={e.company?.message}>
          <Input autoComplete="organization" placeholder="Your company" disabled={busy} {...register("company")} />
        </Field>
      </div>
      <Field id="reg-email" label="Work email" required error={e.email?.message}>
        <Input type="email" autoComplete="email" placeholder="you@company.in" disabled={busy} {...register("email")} />
      </Field>
      <Field id="reg-phone" label="Phone" required error={e.phone?.message} hint="10-digit Indian mobile, +91 optional">
        <Input type="tel" inputMode="numeric" autoComplete="tel" placeholder="+91 98765 43210" disabled={busy} {...register("phone")} />
      </Field>
      <Field id="reg-password" label="Password" required error={e.password?.message} hint="At least 8 characters">
        <PasswordInput autoComplete="new-password" placeholder="••••••••" disabled={busy} {...register("password")} />
      </Field>
      <FormStatus state={state} error={error} successTitle="" onRetry={() => setState("idle")} />
      <Button type="submit" size="lg" disabled={busy || !mounted || unavailable} arrow={!busy} className="w-full">
        {busy ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
        {busy ? "Creating…" : "Create free account"}
      </Button>
      <p className="text-center text-xs text-text-muted">
        By continuing you agree to the <Link href="/terms/" className="link-underline text-text">terms</Link> and <Link href="/privacy/" className="link-underline text-text">privacy policy</Link>.
      </p>
      <p className="text-center text-sm text-text-muted">
        Already have an account? <Link href="/login/" className="link-underline font-medium text-primary">Log in</Link>
      </p>
    </form>
  );
}

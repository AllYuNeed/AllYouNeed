"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { loginSchema, type LoginInput, type LoginOutput } from "@/lib/schemas";
import { getSupabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/useAuth";
import { friendlyAuthError } from "@/lib/auth/errors";
import { safeNext } from "@/lib/auth/redirect";
import { useMounted } from "@/lib/useMounted";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthUnavailable } from "@/components/auth/AuthUnavailable";
import { FormStatus, type FormState } from "./FormStatus";
import { PasswordInput } from "./PasswordInput";

export function LoginForm() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string>();
  const router = useRouter();
  const mounted = useMounted();
  const { status } = useAuth();
  const unavailable = status === "unconfigured";
  const { register, handleSubmit, formState } = useForm<LoginInput, unknown, LoginOutput>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    const supabase = getSupabase();
    if (!supabase) {
      setError("Accounts aren't switched on for this site yet.");
      setState("error");
      return;
    }
    setState("submitting");
    // The password goes to Supabase Auth over HTTPS and nowhere else: never to our own code paths, logs or the URL.
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(friendlyAuthError(authError));
      setState("error");
      return;
    }
    setState("success");
    // `?next=` is set when a protected page sent the visitor here; safeNext only lets same-site paths through.
    router.replace(safeNext(new URLSearchParams(window.location.search).get("next")));
  });

  if (state === "success") {
    return <FormStatus state="success" successTitle="You're logged in." successBody="Taking you to your account…" />;
  }

  const busy = state === "submitting";
  return (
    <form method="post" onSubmit={onSubmit} noValidate aria-label="Log in" className="space-y-5">
      {unavailable ? <AuthUnavailable /> : null}
      <Field id="login-email" label="Work email" required error={formState.errors.email?.message}>
        <Input type="email" autoComplete="email" placeholder="you@company.in" disabled={busy} {...register("email")} />
      </Field>
      <Field id="login-password" label="Password" required error={formState.errors.password?.message}>
        <PasswordInput autoComplete="current-password" placeholder="••••••••" disabled={busy} {...register("password")} />
      </Field>
      <p className="-mt-2 text-right text-sm">
        <Link href="/forgot-password/" className="link-underline text-text-muted hover:text-text">Forgot your password?</Link>
      </p>
      <FormStatus state={state} error={error} successTitle="" onRetry={() => setState("idle")} />
      <Button type="submit" size="lg" disabled={busy || !mounted || unavailable} className="w-full">
        {busy ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
        {busy ? "Signing in…" : "Log in"}
      </Button>
      <p className="text-center text-sm text-text-muted">
        New to Allyouneed? <Link href="/register/" className="link-underline font-medium text-primary">Create a free account</Link>
      </p>
    </form>
  );
}

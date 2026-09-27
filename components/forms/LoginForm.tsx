"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { loginSchema, type LoginInput, type LoginOutput } from "@/lib/schemas";
import { submitForm } from "@/lib/forms";
import { useMounted } from "@/lib/useMounted";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormStatus, type FormState } from "./FormStatus";
import { PasswordInput } from "./PasswordInput";

export function LoginForm() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string>();
  const mounted = useMounted();
  const { register, handleSubmit, formState } = useForm<LoginInput, unknown, LoginOutput>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  const onSubmit = handleSubmit(async ({ email }) => {
    setState("submitting");
    const res = await submitForm("login", { email }); // no backend yet — the password never leaves the browser
    if (res.ok) setState("success");
    else {
      setError(res.error);
      setState("error");
    }
  });

  if (state === "success") {
    return <FormStatus state="success" successTitle="Coming soon: the Allyouneed app is launching shortly." successBody="We've noted your interest. You'll get an email the moment login opens." />;
  }

  const busy = state === "submitting";
  return (
    <form method="post" onSubmit={onSubmit} noValidate aria-label="Log in" className="space-y-5">
      <Field id="login-email" label="Work email" required error={formState.errors.email?.message}>
        <Input type="email" autoComplete="email" placeholder="you@company.in" disabled={busy} {...register("email")} />
      </Field>
      <Field id="login-password" label="Password" required error={formState.errors.password?.message}>
        <PasswordInput autoComplete="current-password" placeholder="••••••••" disabled={busy} {...register("password")} />
      </Field>
      <FormStatus state={state} error={error} successTitle="" onRetry={() => setState("idle")} />
      <Button type="submit" size="lg" disabled={busy || !mounted} className="w-full">
        {busy ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
        {busy ? "Signing in…" : "Log in"}
      </Button>
      <p className="text-center text-sm text-text-muted">
        New to Allyouneed? <Link href="/register/" className="link-underline font-medium text-primary">Create a free account</Link>
      </p>
    </form>
  );
}

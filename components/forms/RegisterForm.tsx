"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { registerSchema, type RegisterInput, type RegisterOutput } from "@/lib/schemas";
import { submitForm } from "@/lib/forms";
import { useMounted } from "@/lib/useMounted";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormStatus, type FormState } from "./FormStatus";
import { PasswordInput } from "./PasswordInput";

export function RegisterForm() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string>();
  const mounted = useMounted();
  const { register, handleSubmit, formState } = useForm<RegisterInput, unknown, RegisterOutput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", company: "", password: "" },
  });

  const onSubmit = handleSubmit(async ({ name, email, phone, company }) => {
    setState("submitting");
    const res = await submitForm("register", { name, email, phone, company }); // password intentionally omitted
    if (res.ok) setState("success");
    else {
      setError(res.error);
      setState("error");
    }
  });

  if (state === "success") {
    return <FormStatus state="success" successTitle="Coming soon: the Allyouneed app is launching shortly." successBody="You're on the early-access list. We'll email you when your workspace is ready." />;
  }

  const busy = state === "submitting";
  const e = formState.errors;
  return (
    <form method="post" onSubmit={onSubmit} noValidate aria-label="Create account" className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="reg-name" label="Full name" required error={e.name?.message}>
          <Input autoComplete="name" placeholder="Arjun Mehta" disabled={busy} {...register("name")} />
        </Field>
        <Field id="reg-company" label="Company" required error={e.company?.message}>
          <Input autoComplete="organization" placeholder="Vasant Interiors" disabled={busy} {...register("company")} />
        </Field>
      </div>
      <Field id="reg-email" label="Work email" required error={e.email?.message}>
        <Input type="email" autoComplete="email" placeholder="arjun@company.in" disabled={busy} {...register("email")} />
      </Field>
      <Field id="reg-phone" label="Phone" required error={e.phone?.message} hint="10-digit Indian mobile, +91 optional">
        <Input type="tel" inputMode="numeric" autoComplete="tel" placeholder="+91 98765 43210" disabled={busy} {...register("phone")} />
      </Field>
      <Field id="reg-password" label="Password" required error={e.password?.message} hint="At least 8 characters">
        <PasswordInput autoComplete="new-password" placeholder="••••••••" disabled={busy} {...register("password")} />
      </Field>
      <FormStatus state={state} error={error} successTitle="" onRetry={() => setState("idle")} />
      <Button type="submit" size="lg" disabled={busy || !mounted} arrow={!busy} className="w-full">
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

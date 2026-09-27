"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { newsletterSchema, type NewsletterInput, type NewsletterOutput } from "@/lib/schemas";
import { submitForm } from "@/lib/forms";
import { useMounted } from "@/lib/useMounted";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormStatus, type FormState } from "./FormStatus";

export function NewsletterForm() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string>();
  const mounted = useMounted();
  const { register, handleSubmit, formState, reset } = useForm<NewsletterInput, unknown, NewsletterOutput>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "", phone: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    setState("submitting");
    const res = await submitForm("newsletter", data);
    if (res.ok) {
      setState("success");
      reset();
    } else {
      setError(res.error);
      setState("error");
    }
  });

  if (state === "success") {
    return <FormStatus state="success" successTitle="You're on the list." successBody="Product updates and compliance reminders, once a month." />;
  }

  const busy = state === "submitting";
  return (
    <form method="post" onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <Field id="newsletter-email" label="Work email" error={formState.errors.email?.message} className="sm:col-span-1">
          <Input type="email" placeholder="you@company.in" autoComplete="email" disabled={busy} {...register("email")} />
        </Field>
        <Field id="newsletter-phone" label="WhatsApp (optional)" error={formState.errors.phone?.message}>
          <Input type="tel" inputMode="numeric" placeholder="+91 98765 43210" autoComplete="tel" disabled={busy} {...register("phone")} />
        </Field>
      </div>
      <FormStatus state={state} error={error} successTitle="" onRetry={() => setState("idle")} />
      <Button type="submit" disabled={busy || !mounted} className="self-start">
        {busy ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
        {busy ? "Subscribing…" : "Subscribe"}
      </Button>
    </form>
  );
}

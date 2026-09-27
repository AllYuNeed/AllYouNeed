"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { contactSchema, teamSizes, type ContactInput, type ContactOutput } from "@/lib/schemas";
import { submitForm } from "@/lib/forms";
import { useMounted } from "@/lib/useMounted";
import { modules } from "@/content/modules";
import { site } from "@/content/site";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { FormStatus, type FormState } from "./FormStatus";
import { cn } from "@/lib/cn";

const teamSizeOptions = teamSizes.map((t) => ({ value: t, label: `${t} people` }));

export function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string>();
  const mounted = useMounted();
  const { register, handleSubmit, formState, control, setValue, reset } = useForm<ContactInput, unknown, ContactOutput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", company: "", modules: [], message: "" },
  });
  const selected = useWatch({ control, name: "modules" }) ?? [];
  const { errors } = formState;

  const toggleModule = (slug: string) => {
    const next = selected.includes(slug) ? selected.filter((s) => s !== slug) : [...selected, slug];
    setValue("modules", next, { shouldValidate: formState.isSubmitted, shouldDirty: true });
  };

  const onSubmit = handleSubmit(async (data) => {
    setState("submitting");
    const res = await submitForm("contact", data);
    if (res.ok) {
      setState("success");
      reset();
    } else {
      setError(res.error);
      setState("error");
    }
  });

  if (state === "success") {
    return <FormStatus state="success" successTitle="Thanks — we'll be in touch within one working day." successBody={`Watch for a calendar invite from ${site.email}. You can reply to it with anything you'd like us to prepare.`} />;
  }

  const busy = state === "submitting";
  return (
    <form method="post" onSubmit={onSubmit} noValidate aria-label="Book a demo" className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Full name" required error={errors.name?.message}>
          <Input autoComplete="name" placeholder="Priya Nair" disabled={busy} {...register("name")} />
        </Field>
        <Field id="email" label="Work email" required error={errors.email?.message}>
          <Input type="email" autoComplete="email" placeholder="priya@company.in" disabled={busy} {...register("email")} />
        </Field>
        <Field id="phone" label="Phone" required error={errors.phone?.message} hint="10-digit Indian mobile, +91 optional">
          <Input type="tel" inputMode="numeric" autoComplete="tel" placeholder="+91 98765 43210" disabled={busy} {...register("phone")} />
        </Field>
        <Field id="company" label="Company" required error={errors.company?.message}>
          <Input autoComplete="organization" placeholder="Meridian Foods" disabled={busy} {...register("company")} />
        </Field>
      </div>
      <Field id="teamSize" label="Team size" required error={errors.teamSize?.message}>
        <Select options={teamSizeOptions} placeholder="Choose a range" disabled={busy} {...register("teamSize")} />
      </Field>

      <fieldset aria-describedby={errors.modules ? "modules-error" : undefined} className="space-y-2">
        <legend className="text-sm font-medium text-text">
          Modules you&apos;re interested in <span className="text-primary">*</span>
        </legend>
        <div className={cn("flex flex-wrap gap-2", errors.modules && "rounded-xl ring-2 ring-red-500/40 ring-offset-2 ring-offset-background")}>
          {modules.map((mod) => (
            <Checkbox key={mod.slug} id={`module-${mod.slug}`} label={mod.name} checked={selected.includes(mod.slug)} onChange={() => toggleModule(mod.slug)} disabled={busy} />
          ))}
        </div>
        {errors.modules ? (
          <p id="modules-error" role="alert" className="text-sm text-red-600 dark:text-red-400">{errors.modules.message}</p>
        ) : null}
      </fieldset>

      <Field id="message" label="Anything specific? (optional)" error={errors.message?.message}>
        <Textarea placeholder="We run four retail branches and file GST under two GSTINs…" disabled={busy} {...register("message")} />
      </Field>

      <FormStatus state={state} error={error} successTitle="" onRetry={() => setState("idle")} />

      <Button type="submit" size="lg" disabled={busy || !mounted} arrow={!busy} className="w-full sm:w-auto">
        {busy ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
        {busy ? "Sending…" : "Book my demo"}
      </Button>
      <p className="text-xs text-text-muted">By submitting you agree to our <a href="/privacy/" className="link-underline text-text">privacy policy</a>. No spam, ever.</p>
    </form>
  );
}

"use client";

import { AnimatePresence, m } from "motion/react";
import { CircleAlert, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ease } from "@/lib/motion";

export type FormState = "idle" | "submitting" | "success" | "error";

type Props = { state: FormState; error?: string; successTitle: string; successBody?: string; onRetry?: () => void };

export function FormStatus({ state, error, successTitle, successBody, onRetry }: Props) {
  return (
    <AnimatePresence mode="wait">
      {state === "success" ? (
        <m.div key="ok" role="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease }} className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-300" />
          <div>
            <p className="font-semibold text-text">{successTitle}</p>
            {successBody ? <p className="text-sm text-text-muted">{successBody}</p> : null}
          </div>
        </m.div>
      ) : state === "error" ? (
        <m.div key="err" role="alert" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease }} className="flex flex-wrap items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <CircleAlert aria-hidden="true" className="size-5 shrink-0 text-red-600 dark:text-red-300" />
          <p className="flex-1 text-sm text-text">{error ?? "Something went wrong."}</p>
          {onRetry ? <Button size="sm" variant="outline" onClick={onRetry}>Retry</Button> : null}
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}

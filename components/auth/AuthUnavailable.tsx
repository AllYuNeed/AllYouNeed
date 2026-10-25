import { TriangleAlert } from "lucide-react";

/** Shown wherever an account feature is used but this build has no Supabase settings (see docs/SUPABASE_SETUP.md). */
export function AuthUnavailable({ className }: { className?: string }) {
  return (
    <div role="status" className={`flex gap-3 rounded-2xl border border-accent/40 bg-accent/10 p-4 text-sm text-text ${className ?? ""}`}>
      <TriangleAlert aria-hidden="true" className="size-5 shrink-0 text-[#854F0B] dark:text-accent" />
      <p>
        <span className="font-semibold">Accounts aren&apos;t switched on for this site yet.</span> Sign-up and log in will work once the site is connected to its
        authentication service. Please check back soon.
      </p>
    </div>
  );
}

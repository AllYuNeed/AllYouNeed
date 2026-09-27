import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { site } from "@/content/site";
import { footerColumns, compliance } from "@/content/nav";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { NewsletterForm } from "@/components/forms/NewsletterForm";

// Evaluated once at build time (static export); keeps render pure.
const year = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-border bg-surface">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Logo href="/" />
            <p className="mt-4 max-w-sm text-text-muted">{site.tagline} HR, payroll, accounting, CRM, inventory and tax filing for growing Indian businesses.</p>
            <div className="mt-8">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-text-muted">Stay in the loop</h2>
              <div className="mt-3 max-w-md">
                <NewsletterForm />
              </div>
            </div>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-text-muted">{col.title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="link-underline text-text hover:text-primary">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 rounded-2xl border border-border bg-background p-6">
          <p className="flex items-center gap-2 text-sm font-medium text-text">
            <ShieldCheck aria-hidden="true" className="size-4 text-primary" />
            Designed to align with
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {compliance.map((c) => (
              <li key={c.code} title={c.label} className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-text-muted">
                {c.code}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-2 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Allyouneed. All rights reserved. {site.legalName}.</p>
          <p>
            <a href={`mailto:${site.email}`} className="link-underline">{site.email}</a> · <a href={site.phoneHref} className="link-underline">{site.phone}</a>
          </p>
        </div>
      </Container>
    </footer>
  );
}

import { TriangleAlert } from "lucide-react";
import type { LegalDoc } from "@/content/legal";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";

const fmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export function LegalLayout({ doc }: { doc: LegalDoc }) {
  return (
    <Container className="py-8 sm:py-12">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Legal</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-text sm:text-5xl">{doc.title}</h1>
        <p className="mt-3 text-sm text-text-muted">Last updated {fmt.format(new Date(doc.updated))}</p>
        <div role="note" className="mt-6 flex gap-3 rounded-2xl border border-accent/40 bg-accent/10 p-4 text-sm text-text">
          <TriangleAlert aria-hidden="true" className="size-5 shrink-0 text-[#854F0B] dark:text-accent" />
          <p>Sample text: have a lawyer review this document before launch. It is written with the DPDP Act 2023 in mind but is not legal advice.</p>
        </div>
      </Reveal>
      <div className="mt-12 grid gap-12 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Contents" className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Contents</p>
          <ol className="mt-3 space-y-1.5 border-l border-border text-sm">
            {doc.sections.map((s, i) => (
              <li key={s.heading}>
                <a href={`#section-${i + 1}`} className="block px-4 py-1 text-text-muted transition-colors hover:text-primary">{s.heading}</a>
              </li>
            ))}
          </ol>
        </nav>
        <article className="max-w-3xl">
          <p className="text-lg text-text-muted">{doc.intro}</p>
          {doc.sections.map((s, i) => (
            <Reveal key={s.heading} as="section" className="mt-10">
              <h2 id={`section-${i + 1}`} className="font-display text-xl font-bold text-text scroll-mt-28">{s.heading}</h2>
              {s.body.map((p) => (
                <p key={p} className="mt-3 leading-relaxed text-text-muted">{p}</p>
              ))}
            </Reveal>
          ))}
        </article>
      </div>
    </Container>
  );
}

import { Check, Minus } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { plans, comparisonRows } from "@/content/pricing";
import { cn } from "@/lib/cn";

export function ComparisonTable() {
  return (
    <Section tone="surface" id="compare">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="Compare" title="Everything in every plan" />
        </Reveal>
        {/* relative: the scroller must contain the absolutely positioned sr-only labels, or they widen the page. */}
        <Reveal className="relative mt-12 overflow-x-auto rounded-2xl border border-border bg-background shadow-soft">
          <table aria-label="Compare plans" className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="sticky left-0 bg-background px-5 py-4 font-medium text-text-muted">Feature</th>
                {plans.map((p) => (
                  <th key={p.id} scope="col" className={cn("px-5 py-4 font-display text-base font-bold text-text", p.highlight && "text-primary")}>{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.label} className="border-b border-border/60 transition-colors last:border-0 hover:bg-surface/70">
                  <th scope="row" className="sticky left-0 bg-background px-5 py-3.5 font-medium text-text">{row.label}</th>
                  {plans.map((p) => {
                    const v = row.values[p.id];
                    return (
                      <td key={p.id} className="px-5 py-3.5 text-text-muted">
                        {v === true ? (
                          <span className="inline-grid size-6 place-items-center rounded-full bg-primary-soft text-primary-ink"><Check aria-hidden="true" className="size-3.5" strokeWidth={3} /><span className="sr-only">Included</span></span>
                        ) : v === false ? (
                          <span className="inline-grid size-6 place-items-center rounded-full bg-surface text-text-muted"><Minus aria-hidden="true" className="size-3.5" /><span className="sr-only">Not included</span></span>
                        ) : (
                          v
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </Container>
    </Section>
  );
}

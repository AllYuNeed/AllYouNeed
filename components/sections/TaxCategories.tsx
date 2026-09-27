import { Check } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { SpotlightCard } from "@/components/motion/SpotlightCard";
import { taxCategories } from "@/content/tax";

export function TaxCategories() {
  return (
    <Section className="pt-8 sm:pt-12">
      <Container>
        {/* The page goes h1 -> these h3 cards; a visually hidden h2 keeps the outline from skipping a level. */}
        <h2 className="sr-only">Filing categories</h2>
        <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {taxCategories.map((c) => (
            <StaggerItem key={c.slug} className="h-full">
              <SpotlightCard as="article" id={c.slug} className="h-full scroll-mt-28">
                <span className="grid size-11 place-items-center rounded-xl bg-accent/15 text-[#854F0B] dark:text-accent"><c.icon aria-hidden="true" className="size-5" /></span>
                <h3 className="mt-4 font-display text-xl font-bold text-text">{c.name}</h3>
                <p className="mt-1.5 text-sm text-text-muted">{c.tagline}</p>
                <ul className="mt-5 space-y-2">
                  {c.filings.map((f) => (
                    <li key={f} className="flex gap-2.5 text-sm text-text">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary-soft text-primary-ink"><Check aria-hidden="true" className="size-3" strokeWidth={3} /></span>
                      {f}
                    </li>
                  ))}
                </ul>
              </SpotlightCard>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}

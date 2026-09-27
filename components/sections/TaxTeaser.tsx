import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { SpotlightCard } from "@/components/motion/SpotlightCard";
import { taxCategories } from "@/content/tax";

export function TaxTeaser() {
  return (
    <Section id="tax">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="Tax & compliance" title="Every tax. One place to file it." lead="GST, TDS, income tax, PF and ESI, ROC — prepared from your live books, reviewed by you, filed on the calendar." />
        </Reveal>
        <Stagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {taxCategories.map((c) => (
            <StaggerItem key={c.slug} className="h-full">
              <SpotlightCard as="a" href={`/tax-compliance/#${c.slug}`} className="block h-full">
                <span className="grid size-11 place-items-center rounded-xl bg-accent/15 text-[#854F0B] dark:text-accent"><c.icon aria-hidden="true" className="size-5" /></span>
                <h3 className="mt-4 font-display text-lg font-bold text-text">{c.name}</h3>
                <p className="mt-1.5 text-sm text-text-muted">{c.tagline}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {c.filings.slice(0, 3).map((f) => (
                    <li key={f} className="rounded-full border border-border px-2.5 py-1 text-xs text-text-muted">{f.split(" (")[0]}</li>
                  ))}
                </ul>
              </SpotlightCard>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal className="mt-10 text-center">
          <Button href="/tax-compliance/" variant="outline" arrow>See every filing we cover</Button>
        </Reveal>
      </Container>
    </Section>
  );
}

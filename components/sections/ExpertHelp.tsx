import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { expertServices } from "@/content/experts";

export function ExpertHelp() {
  return (
    <Section tone="surface" id="experts">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="Expert help" title="A professional, when you need one" lead="Software does the routine. For everything else, a chartered accountant is a click away — inside the same platform, working on the same data." />
        </Reveal>
        <Stagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {expertServices.map((s) => (
            <StaggerItem key={s.title} className="h-full">
              <Card hover className="group h-full">
                <span className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary-ink transition-transform duration-500 motion-safe:group-hover:scale-110"><s.icon aria-hidden="true" className="size-5" /></span>
                <h3 className="mt-4 font-display text-lg font-bold text-text">{s.title}</h3>
                <p className="mt-1.5 text-sm text-text-muted">{s.body}</p>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal className="mt-10 text-center">
          <Button href="/contact/" variant="outline" arrow>Talk to an expert</Button>
        </Reveal>
      </Container>
    </Section>
  );
}

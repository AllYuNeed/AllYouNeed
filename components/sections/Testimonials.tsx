import { Quote } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { testimonials } from "@/content/testimonials";

export function Testimonials() {
  return (
    <Section id="testimonials">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="Customers" title="Teams that switched, in their words" />
        </Reveal>
        <Stagger className="mt-14 grid gap-4 lg:grid-cols-3">
          {testimonials.map((t) => (
            <StaggerItem key={t.name} className="h-full">
              <Card hover as="article" className="flex h-full flex-col">
                <Quote aria-hidden="true" className="size-8 text-primary/40" />
                <blockquote className="mt-4 flex-1 text-lg leading-relaxed text-text">“{t.quote}”</blockquote>
                <footer className="mt-6 flex items-center gap-3">
                  <span aria-hidden="true" className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-primary to-accent font-display text-sm font-bold text-white">{t.initials}</span>
                  <div>
                    <p className="font-semibold text-text">{t.name}</p>
                    <p className="text-sm text-text-muted">{t.role}, {t.company}</p>
                  </div>
                </footer>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}

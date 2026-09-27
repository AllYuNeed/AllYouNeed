import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Accordion } from "@/components/ui/Accordion";
import { faqs } from "@/content/faq";

export function Faq() {
  return (
    <Section id="faq">
      <Container className="max-w-3xl">
        <Reveal>
          <SectionHeading eyebrow="FAQ" title="Questions, answered" />
        </Reveal>
        <Reveal className="mt-12">
          <Accordion items={faqs.map((f, i) => ({ id: `faq-${i}`, q: f.q, a: f.a }))} defaultOpen="faq-0" />
        </Reveal>
      </Container>
    </Section>
  );
}

import { Check } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { ItrMock } from "@/components/mockups";

const bullets = ["Form 16 data pre-filled from payroll", "Deductions suggested from declarations already on file", "E-verify with Aadhaar OTP, no portal juggling", "Refund tracking on the employee's dashboard"];

export function EmployeeItr() {
  return (
    <Section id="employee-itr">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal variant="scaleIn" className="order-2 lg:order-1">
            <TiltCard max={5}>
              <div className="rounded-2xl border border-border bg-background p-4 shadow-lift sm:p-6">
                <ItrMock />
              </div>
            </TiltCard>
          </Reveal>
          <div className="order-1 lg:order-2">
            <Reveal>
              <SectionHeading align="left" eyebrow="For every employee" title="Every employee files their return in minutes" lead="Because payroll already knows the numbers, an ITR-1 takes four minutes, not a weekend. A perk for your team, zero work for HR." />
            </Reveal>
            <ul className="mt-8 space-y-3">
              {bullets.map((b, i) => (
                <Reveal key={b} as="li" delay={i * 0.06}>
                  <div className="flex gap-3 text-text-muted">
                    <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-primary-soft text-primary-ink"><Check aria-hidden="true" className="size-3" strokeWidth={3} /></span>
                    {b}
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}

import { Bot, Lock } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { integrations } from "@/content/integrations";

export function Integrations() {
  return (
    <Section tone="surface" id="integrations">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="Integrations" title="Connected to how you work" lead="Payments, messaging, ads, listings and telephony plug straight into the right module. No middleware, no CSVs." />
        </Reveal>
        <Stagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map((it) => (
            <StaggerItem key={it.name}>
              <Card hover className="group h-full">
                <span className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary-ink transition-transform duration-500 motion-safe:group-hover:rotate-[8deg]">
                  <it.icon aria-hidden="true" className="size-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-text">{it.name}</h3>
                <p className="mt-1.5 text-sm text-text-muted">{it.blurb}</p>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Reveal>
            <Card className="relative h-full overflow-hidden bg-gradient-to-br from-primary to-[#7F77DD] text-white dark:from-primary-solid dark:to-[#4B43A6]">
              <span className="absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
              <Bot aria-hidden="true" className="size-7" />
              <h3 className="mt-4 font-display text-xl font-bold">AI across every module</h3>
              <p className="mt-2 text-white/85 dark:text-white">Duplicate vendors, mismatched input tax credit, a payslip that jumped 40%, a lead that went quiet — flagged before they cost you, with a one-line explanation.</p>
            </Card>
          </Reveal>
          <Reveal delay={0.1}>
            <Card className="h-full">
              <Lock aria-hidden="true" className="size-7 text-primary" />
              <h3 className="mt-4 font-display text-xl font-bold text-text">Enterprise-grade security</h3>
              <p className="mt-2 text-text-muted">Encryption in transit and at rest, role-based access per branch and module, full audit logs and Indian data residency. Designed to align with the DPDP Act 2023, ISO 27001 and SOC 2.</p>
            </Card>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

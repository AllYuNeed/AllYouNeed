import { Building2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Marquee } from "@/components/motion/Marquee";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { stats, trustHeadline, trustLogos } from "@/content/stats";

export function TrustBar() {
  return (
    <section aria-labelledby="trust-heading" className="border-y border-border bg-surface/60 py-14">
      <Container>
        <Reveal variant="fadeIn">
          <p id="trust-heading" className="text-center text-sm font-medium text-text-muted">
            {trustHeadline}
          </p>
        </Reveal>
        <Marquee className="mt-8" speed={45}>
          {trustLogos.map((name) => (
            <span key={name} className="flex items-center gap-2 whitespace-nowrap font-display text-lg font-bold text-text-muted/70 transition-colors hover:text-text">
              <Building2 aria-hidden="true" className="size-5" />
              {name}
            </span>
          ))}
        </Marquee>
        <Stagger className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((s) => (
            <StaggerItem key={s.label} className="text-center">
              <p className="font-display text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
                <CountUp value={s.value} suffix={s.suffix} decimals={s.decimals} />
              </p>
              <p className="mt-1 text-sm text-text-muted">{s.label}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}

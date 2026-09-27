import { ArrowUpRight } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { SpotlightCard } from "@/components/motion/SpotlightCard";
import { modules } from "@/content/modules";

export function ModuleGrid() {
  return (
    <Section id="modules">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={`${modules.length} core modules`} title="Everything a growing company needs" lead="Start with the two you need today. Turn on the rest when you're ready — the data is already there." />
        </Reveal>
        <Stagger gap={0.06} className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {modules.map((mod) => (
            <StaggerItem key={mod.slug} className="h-full">
              <SpotlightCard as="a" href={`/features/#${mod.slug}`} className="block h-full">
                <div className="flex items-start justify-between">
                  <span className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary-ink transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:-rotate-6 motion-safe:group-hover:scale-110">
                    <mod.icon aria-hidden="true" className="size-6" />
                  </span>
                  <ArrowUpRight aria-hidden="true" className="size-5 text-text-muted opacity-0 transition-all duration-300 motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5 group-hover:opacity-100" />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-text">{mod.name}</h3>
                <p className="mt-2 text-sm text-text-muted">{mod.short}</p>
              </SpotlightCard>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}

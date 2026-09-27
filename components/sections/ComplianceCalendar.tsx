import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { complianceCalendar } from "@/content/tax";
import { cn } from "@/lib/cn";

const days = Array.from({ length: 31 }, (_, i) => i + 1);

export function ComplianceCalendar() {
  const dueDays = new Set(complianceCalendar.map((c) => c.day));
  return (
    <Section tone="surface" id="calendar">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="Compliance calendar" title="A typical month, already scheduled" lead="Every due date is on your dashboard with the return pre-prepared. Reminders go to the right person on WhatsApp and email." />
        </Reveal>
        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <Reveal variant="scaleIn">
            <div className="rounded-2xl border border-border bg-background p-5 shadow-soft">
              <p className="font-display text-sm font-bold text-text">This month</p>
              <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-xs">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <span key={i} className="py-1 font-semibold text-text-muted">{d}</span>
                ))}
                {days.map((d) => {
                  const due = dueDays.has(d);
                  return (
                    <span
                      key={d}
                      title={due ? complianceCalendar.filter((c) => c.day === d).map((c) => c.title).join(" · ") : undefined}
                      className={cn("grid aspect-square place-items-center rounded-lg transition-transform duration-300 motion-safe:hover:scale-110", due ? "bg-primary-solid font-bold text-white shadow-soft" : "bg-surface text-text-muted")}
                    >
                      {d}
                    </span>
                  );
                })}
              </div>
            </div>
          </Reveal>
          <Stagger className="space-y-2.5">
            {complianceCalendar.map((c) => (
              <StaggerItem key={`${c.day}-${c.title}`}>
                <div className="flex items-center gap-4 rounded-xl border border-border bg-background px-4 py-3 transition-colors hover:border-primary/40">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft font-display text-lg font-bold text-primary-ink">{c.day}</span>
                  <p className="flex-1 text-sm font-medium text-text">{c.title}</p>
                  <Badge tone="neutral">{c.category}</Badge>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Container>
    </Section>
  );
}

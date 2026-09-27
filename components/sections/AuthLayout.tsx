import { Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/motion/Reveal";
import { AnimatedLogo } from "@/components/brand/AnimatedLogo";
import { TiltCard } from "@/components/motion/TiltCard";
import { BrowserFrame, DashboardMock } from "@/components/mockups";

const proof = ["Free for up to 5 users", "GST-ready in a day", "Import from Tally or Excel"];

export function AuthLayout({ title, lead, children }: { title: string; lead: string; children: React.ReactNode }) {
  return (
    <Container className="py-8 sm:py-12">
      <div className="grid items-stretch gap-8 lg:grid-cols-2">
        <Reveal variant="scaleIn" className="relative hidden overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-[#6A61CF] to-[#7F77DD] dark:from-primary-solid dark:via-[#5A51C0] dark:to-[#4B43A6] p-10 text-white lg:block">
          <div aria-hidden="true" className="absolute inset-0 dot-grid opacity-25" />
          <div aria-hidden="true" className="absolute -right-24 -top-24 size-80 rounded-full bg-accent/30 blur-3xl animate-aurora" />
          <div className="relative flex h-full flex-col">
            {/* White chip: the indigo tiles would vanish into the indigo gradient (dark --primary is #7F77DD). */}
            <span className="grid w-fit place-items-center rounded-2xl bg-white p-3 shadow-lift">
              <AnimatedLogo size={52} />
            </span>
            {/* A <p>, not a heading: it repeats the tagline and would precede the page h1 in DOM order. */}
            <p className="mt-8 font-display text-3xl font-extrabold tracking-tight">Everything your business runs on. One OS.</p>
            <ul className="mt-6 space-y-2.5">
              {proof.map((p) => (
                <li key={p} className="flex items-center gap-2.5 text-white/90 dark:text-white"><Check aria-hidden="true" className="size-4" strokeWidth={3} /> {p}</li>
              ))}
            </ul>
            <div className="mt-auto pt-10">
              <TiltCard max={6}>
                <BrowserFrame url="app.allyouneed.in/dashboard" className="dark">
                  <DashboardMock compact />
                </BrowserFrame>
              </TiltCard>
            </div>
          </div>
        </Reveal>
        <Reveal className="flex items-center">
          <Card className="w-full p-6 sm:p-10">
            <h1 className="font-display text-3xl font-bold tracking-tight text-text">{title}</h1>
            <p className="mt-2 text-text-muted">{lead}</p>
            <div className="mt-8">{children}</div>
          </Card>
        </Reveal>
      </div>
    </Container>
  );
}

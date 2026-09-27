import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { ShieldCheck } from "lucide-react";
import { about } from "@/content/about";
import { compliance } from "@/content/nav";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { AnimatedLogo } from "@/components/brand/AnimatedLogo";
import { FinalCta } from "@/components/sections/FinalCta";

export const metadata: Metadata = pageMeta("/about/", "About", "Why Allyouneed exists, what we believe, and how we keep your data safe.");

export default function AboutPage() {
  return (
    <>
      <Container className="pt-8 sm:pt-12">
        <Reveal>
          <div className="flex flex-col items-center text-center">
            <AnimatedLogo size={80} />
            <SectionHeading as="h1" className="mt-6" eyebrow="About Allyouneed" title="Built so growing businesses can run like big ones" lead={about.mission} />
          </div>
        </Reveal>
      </Container>

      <Section>
        <Container className="max-w-3xl">
          <Reveal>
            <h2 className="font-display text-2xl font-bold text-text sm:text-3xl">Our story</h2>
          </Reveal>
          {about.story.map((p, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <p className="mt-5 text-lg leading-relaxed text-text-muted">{p}</p>
            </Reveal>
          ))}
        </Container>
      </Section>

      <Section tone="surface">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="Values" title="What we optimise for" />
          </Reveal>
          <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {about.values.map((v) => (
              <StaggerItem key={v.title} className="h-full">
                <Card hover className="group h-full">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary-ink transition-transform duration-500 motion-safe:group-hover:-rotate-6"><v.icon aria-hidden="true" className="size-5" /></span>
                  <h3 className="mt-4 font-display text-lg font-bold text-text">{v.title}</h3>
                  <p className="mt-1.5 text-sm text-text-muted">{v.body}</p>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal>
            <SectionHeading eyebrow="Security & compliance" title="Your data, treated like ours" />
          </Reveal>
          <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {about.security.map((s) => (
              <StaggerItem key={s.title} className="h-full">
                <Card hover className="h-full">
                  <s.icon aria-hidden="true" className="size-6 text-primary" />
                  <h3 className="mt-4 font-display text-lg font-bold text-text">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-text-muted">{s.body}</p>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal className="mt-8">
            <div className="rounded-2xl border border-border bg-surface p-6">
              <p className="flex items-center gap-2 text-sm font-medium text-text"><ShieldCheck aria-hidden="true" className="size-4 text-primary" /> Designed to align with</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {compliance.map((c) => (
                  <li key={c.code} className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-text-muted" title={c.label}>{c.code} · {c.label}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </Container>
      </Section>

      <FinalCta title="Come run your business with us." body="Start free today, or book a demo and meet the team." />
    </>
  );
}

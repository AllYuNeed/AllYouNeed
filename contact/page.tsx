import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { site } from "@/content/site";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata: Metadata = pageMeta("/contact/", "Contact & book a demo", "Book a 20-minute demo of Allyouneed, or reach the team by email and phone.");

const steps = [
  { n: "1", t: "We confirm a slot", b: "Within one working day, on email and WhatsApp." },
  { n: "2", t: "20-minute walkthrough", b: "Your departments, mapped to modules — with your sample data if you share it." },
  { n: "3", t: "Free workspace", b: "Leave the call with a live account and an import plan." },
];

export default function ContactPage() {
  return (
    <>
      <Container className="pt-8 sm:pt-12">
        <Reveal>
          <SectionHeading as="h1" eyebrow="Contact" title="Book a demo" lead="Tell us a little about your business and we'll show you Allyouneed running the way you work." />
        </Reveal>
      </Container>
      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <Reveal variant="scaleIn">
            <Card className="p-6 sm:p-8">
              <ContactForm />
            </Card>
          </Reveal>
          <div className="space-y-6">
            <Reveal delay={0.1}>
              <Card>
                <h2 className="font-display text-lg font-bold text-text">Reach us directly</h2>
                <ul className="mt-4 space-y-3 text-sm">
                  <li className="flex gap-3"><Mail aria-hidden="true" className="size-5 shrink-0 text-primary" /><a href={`mailto:${site.email}`} className="link-underline text-text">{site.email}</a></li>
                  <li className="flex gap-3"><Phone aria-hidden="true" className="size-5 shrink-0 text-primary" /><a href={site.phoneHref} className="link-underline text-text">{site.phone}</a></li>
                  <li className="flex gap-3"><MapPin aria-hidden="true" className="size-5 shrink-0 text-primary" /><span className="text-text-muted">{site.address}</span></li>
                  <li className="flex gap-3"><Clock aria-hidden="true" className="size-5 shrink-0 text-primary" /><span className="text-text-muted">{site.hours}</span></li>
                </ul>
              </Card>
            </Reveal>
            <Stagger className="space-y-3">
              <StaggerItem><h2 className="font-display text-lg font-bold text-text">What happens next</h2></StaggerItem>
              {steps.map((s) => (
                <StaggerItem key={s.n}>
                  <div className="flex gap-4 rounded-2xl border border-border bg-background p-4">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-solid font-display font-bold text-white">{s.n}</span>
                    <div>
                      <p className="font-semibold text-text">{s.t}</p>
                      <p className="text-sm text-text-muted">{s.b}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </Container>
    </>
  );
}

import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { PricingTable } from "@/components/sections/PricingTable";
import { ComparisonTable } from "@/components/sections/ComparisonTable";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";

export const metadata: Metadata = pageMeta("/pricing/", "Pricing", "Free for up to five users. Growth, Business and Enterprise plans in INR with GST filing, payroll and a dedicated CA. Save 20% on yearly billing.");

export default function PricingPage() {
  return (
    <>
      <Container className="pb-10 pt-8 sm:pt-12">
        <Reveal>
          <SectionHeading as="h1" eyebrow="Pricing" title="Simple pricing that grows with you" lead="Start free. Pay only when you add people or modules. No setup fees, no lock-in." />
        </Reveal>
      </Container>
      <PricingTable />
      <ComparisonTable />
      <Faq />
      <FinalCta title="Not sure which plan?" body="Book a 20-minute demo and we'll map your departments to the right modules — and tell you honestly if the free plan is enough." />
    </>
  );
}

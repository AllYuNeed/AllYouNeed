import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { TaxCategories } from "@/components/sections/TaxCategories";
import { ComplianceCalendar } from "@/components/sections/ComplianceCalendar";
import { JourneyTimeline } from "@/components/sections/JourneyTimeline";
import { ExpertHelp } from "@/components/sections/ExpertHelp";
import { FinalCta } from "@/components/sections/FinalCta";

export const metadata: Metadata = pageMeta("/tax-compliance/", "Tax & Compliance", "GST, TDS, income tax, PF/ESI, ROC filings and registrations — prepared from your live books and filed on a compliance calendar.");

export default function TaxCompliancePage() {
  return (
    <>
      <Container className="pt-8 sm:pt-12">
        <Reveal>
          <SectionHeading as="h1" eyebrow="Tax & compliance" title="Every tax. One place to file it." lead="Returns are prepared from your live books, reconciled with the government portal, reviewed by you and filed on time. No exports, no re-typing." />
        </Reveal>
      </Container>
      <TaxCategories />
      <ComplianceCalendar />
      <JourneyTimeline />
      <ExpertHelp />
      <FinalCta title="File every return from one place." body="Start free, connect your GSTIN and see this month's returns prepared from your data." />
    </>
  );
}

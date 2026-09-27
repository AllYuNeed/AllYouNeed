import type { Metadata } from "next";
import { homeMeta } from "@/lib/seo";
import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { ValueProp } from "@/components/sections/ValueProp";
import { ModuleShowcase } from "@/components/sections/ModuleShowcase";
import { ModuleGrid } from "@/components/sections/ModuleGrid";
import { Integrations } from "@/components/sections/Integrations";
import { MobileApp } from "@/components/sections/MobileApp";
import { AiWorkflow } from "@/components/sections/AiWorkflow";
import { TaxTeaser } from "@/components/sections/TaxTeaser";
import { JourneyTimeline } from "@/components/sections/JourneyTimeline";
import { EmployeeItr } from "@/components/sections/EmployeeItr";
import { ExpertHelp } from "@/components/sections/ExpertHelp";
import { Testimonials } from "@/components/sections/Testimonials";
import { FinalCta } from "@/components/sections/FinalCta";

export const metadata: Metadata = homeMeta;

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <ValueProp />
      <ModuleShowcase />
      <ModuleGrid />
      <Integrations />
      <MobileApp />
      <AiWorkflow />
      <TaxTeaser />
      <JourneyTimeline />
      <EmployeeItr />
      <ExpertHelp />
      <Testimonials />
      <FinalCta />
    </>
  );
}

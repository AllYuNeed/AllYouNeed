import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { FeatureDetail } from "@/components/sections/FeatureDetail";
import { FeatureSideNav } from "@/components/sections/FeatureSideNav";
import { FinalCta } from "@/components/sections/FinalCta";
import { modules } from "@/content/modules";

export const metadata: Metadata = pageMeta("/features/", "Features", `${modules.length} modules — HR, payroll, accounting, CRM, inventory and POS, attendance, tax filing, projects, assets, reports, communications and integrations — on one database.`);

export default function FeaturesPage() {
  return (
    <>
      <Container className="pb-8 pt-8 sm:pt-12">
        <Reveal>
          <SectionHeading as="h1" eyebrow="Features" title="Every module, one database" lead="Turn on what you need today. Everything you add later already knows your customers, employees, stock and books." />
        </Reveal>
      </Container>
      <Container>
        <div className="grid gap-10 lg:grid-cols-[200px_1fr] lg:gap-16">
          <FeatureSideNav items={modules.map((mod) => ({ id: mod.slug, label: mod.name }))} />
          <div className="divide-y divide-border">
            {modules.map((mod, i) => (
              <FeatureDetail key={mod.slug} module={mod} index={i} />
            ))}
          </div>
        </div>
      </Container>
      <FinalCta title="Turn on your first module today." body="Free for up to five users. Add modules as you grow — the data is already connected." />
    </>
  );
}

import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { LegalLayout } from "@/components/sections/LegalLayout";
import { privacyDoc } from "@/content/legal";

export const metadata: Metadata = pageMeta("/privacy/", "Privacy Policy", "How Allyouneed collects, uses and protects personal data under the DPDP Act 2023.");

export default function PrivacyPage() {
  return <LegalLayout doc={privacyDoc} />;
}

import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { LegalLayout } from "@/components/sections/LegalLayout";
import { termsDoc } from "@/content/legal";

export const metadata: Metadata = pageMeta("/terms/", "Terms & Conditions", "Terms governing use of the Allyouneed platform.");

export default function TermsPage() {
  return <LegalLayout doc={termsDoc} />;
}

import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { LegalLayout } from "@/components/sections/LegalLayout";
import { refundDoc } from "@/content/legal";

export const metadata: Metadata = pageMeta("/refund/", "Refund Policy", "When Allyouneed subscription fees are refunded.");

export default function RefundPage() {
  return <LegalLayout doc={refundDoc} />;
}

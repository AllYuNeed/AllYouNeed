import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { AuthLayout } from "@/components/sections/AuthLayout";
import { AuthCallback } from "@/components/auth/AuthCallback";

const lead = "One moment while we check your link.";

export const metadata: Metadata = {
  ...pageMeta("/auth/callback/", "Signing you in", lead),
  robots: { index: false, follow: false },
};

export default function AuthCallbackPage() {
  return (
    <AuthLayout title="Signing you in" lead={lead}>
      <AuthCallback />
    </AuthLayout>
  );
}

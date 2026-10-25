import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { AuthLayout } from "@/components/sections/AuthLayout";
import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm";

const lead = "Enter your work email and we'll send you a link to choose a new password.";

export const metadata: Metadata = {
  ...pageMeta("/forgot-password/", "Reset your password", lead),
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout title="Forgot your password?" lead={lead}>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}

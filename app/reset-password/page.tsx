import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { AuthLayout } from "@/components/sections/AuthLayout";
import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";

const lead = "Pick something at least 8 characters long that you don't use anywhere else.";

export const metadata: Metadata = {
  ...pageMeta("/reset-password/", "Choose a new password", lead),
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <AuthLayout title="Choose a new password" lead={lead}>
      <ResetPasswordForm />
    </AuthLayout>
  );
}

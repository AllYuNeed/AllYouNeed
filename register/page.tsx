import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { AuthLayout } from "@/components/sections/AuthLayout";
import { RegisterForm } from "@/components/forms/RegisterForm";

export const metadata: Metadata = {
  ...pageMeta("/register/", "Create your free account", "Five users, accounting and CRM, no card needed. Upgrade whenever you're ready."),
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <AuthLayout title="Start free" lead="Five users, accounting and CRM, no card needed. Upgrade whenever you're ready.">
      <RegisterForm />
    </AuthLayout>
  );
}

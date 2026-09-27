import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { AuthLayout } from "@/components/sections/AuthLayout";
import { LoginForm } from "@/components/forms/LoginForm";

export const metadata: Metadata = { ...pageMeta("/login/", "Log in", "Log in to your Allyouneed workspace."), robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <AuthLayout title="Welcome back" lead="Log in to your Allyouneed workspace.">
      <LoginForm />
    </AuthLayout>
  );
}

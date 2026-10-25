import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { AccountPage } from "@/components/account/AccountPage";

export const metadata: Metadata = {
  ...pageMeta("/account/", "Your account", "Manage your Allyouneed account."),
  robots: { index: false, follow: false },
};

export default function Account() {
  return (
    <Container className="max-w-3xl py-8 sm:py-12">
      <h1 className="font-display text-4xl font-bold tracking-tight text-text sm:text-5xl">Your account</h1>
      <div className="mt-8">
        <AccountPage />
      </div>
    </Container>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { site } from "@/content/site";
import { baseOpenGraph, baseTwitter, homeTitle } from "@/lib/seo";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { BackToTop } from "@/components/motion/BackToTop";
import { noscriptCss } from "@/lib/noscript";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap", weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: homeTitle, template: "%s · Allyouneed" },
  description: site.description,
  applicationName: "Allyouneed",
  keywords: ["business OS", "ERP India", "GST filing software", "payroll software India", "accounting software", "CRM", "inventory POS"],
  // Base only (no url/title): routes without their own metadata, such as the 404, must not claim the home page's
  // og:url. Every page sets its own through lib/seo.ts.
  openGraph: baseOpenGraph,
  twitter: baseTwitter,
  icons: { icon: "/icon.svg", apple: "/brand/apple-icon.png" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1020" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jakarta.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <noscript>
          <style>{noscriptCss}</style>
        </noscript>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary-solid focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Providers>
          <ScrollProgress />
          <Navbar />
          <main id="main" className="flex-1 pt-24">
            {children}
          </main>
          <Footer />
          <BackToTop />
        </Providers>
      </body>
    </html>
  );
}

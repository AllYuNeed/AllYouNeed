import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export const dynamic = "force-static";

const publicRoutes: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/features/", priority: 0.9 },
  { path: "/tax-compliance/", priority: 0.9 },
  { path: "/pricing/", priority: 0.9 },
  { path: "/contact/", priority: 0.8 },
  { path: "/about/", priority: 0.6 },
  { path: "/terms/", priority: 0.3 },
  { path: "/privacy/", priority: 0.3 },
  { path: "/refund/", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((r) => ({ url: `${site.url}${r.path}`, changeFrequency: "monthly", priority: r.priority }));
}

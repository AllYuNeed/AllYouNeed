import type { Metadata } from "next";
import { site } from "@/content/site";

export const homeTitle = `${site.name} — ${site.tagline}`;

// The one Open Graph image every route shares. Relative URLs resolve against the layout's metadataBase.
export const ogImage = { url: "/brand/og.png", width: 1200, height: 630, alt: homeTitle };

// Next replaces a parent's openGraph/twitter object wholesale when a page sets its own, so every page-level
// object must spread these back in.
export const baseOpenGraph = { type: "website", siteName: site.name, locale: "en_IN", images: [ogImage] } satisfies Metadata["openGraph"];
export const baseTwitter = { card: "summary_large_image", images: [ogImage.url] } satisfies Metadata["twitter"];

function social(path: string, socialTitle: string, description: string): Pick<Metadata, "alternates" | "openGraph" | "twitter"> {
  return {
    alternates: { canonical: path },
    openGraph: { ...baseOpenGraph, url: path, title: socialTitle, description },
    twitter: { ...baseTwitter, title: socialTitle, description },
  };
}

/** Per-page metadata: its own canonical, og:url and social titles, so a shared link previews and opens that page. */
export function pageMeta(path: string, title: string, description: string): Metadata {
  return { title, description, ...social(path, `${title} · ${site.name}`, description) };
}

/** The home page keeps the layout's default title and uses it verbatim on social cards. */
export const homeMeta: Metadata = {
  title: { absolute: homeTitle },
  description: site.description,
  ...social("/", homeTitle, site.description),
};

import { test, expect } from "vitest";
import type { Metadata } from "next";
import { pageMeta, ogImage } from "@/lib/seo";
import { metadata as home } from "@/app/page";
import { metadata as features } from "@/app/features/page";
import { metadata as tax } from "@/app/tax-compliance/page";
import { metadata as pricing } from "@/app/pricing/page";
import { metadata as contact } from "@/app/contact/page";
import { metadata as about } from "@/app/about/page";
import { metadata as terms } from "@/app/terms/page";
import { metadata as privacy } from "@/app/privacy/page";
import { metadata as refund } from "@/app/refund/page";
import { metadata as login } from "@/app/login/page";
import { metadata as register } from "@/app/register/page";

type Og = { url?: unknown; title?: unknown; description?: unknown; images?: unknown; siteName?: unknown; locale?: unknown; type?: unknown };
type Tw = { card?: unknown; title?: unknown; images?: unknown };
const og = (m: Metadata) => (m.openGraph ?? {}) as Og;
const tw = (m: Metadata) => (m.twitter ?? {}) as Tw;

test("pageMeta gives a page its own canonical, og:url and social titles, with the shared image", () => {
  const m = pageMeta("/pricing/", "Pricing", "Plans in INR.");
  expect(m.title).toBe("Pricing");
  expect(m.description).toBe("Plans in INR.");
  expect(m.alternates?.canonical).toBe("/pricing/");
  expect(og(m).url).toBe("/pricing/");
  expect(og(m).title).toBe("Pricing · Allyouneed");
  expect(og(m).description).toBe("Plans in INR.");
  expect(og(m).type).toBe("website");
  expect(og(m).siteName).toBe("Allyouneed");
  expect(og(m).locale).toBe("en_IN");
  expect(og(m).images).toEqual([ogImage]);
  expect(ogImage).toMatchObject({ url: "/brand/og.png", width: 1200, height: 630 });
  expect(tw(m).card).toBe("summary_large_image");
  expect(tw(m).title).toBe("Pricing · Allyouneed");
  expect(tw(m).images).toEqual(["/brand/og.png"]);
});

test.each([
  ["/features/", features],
  ["/tax-compliance/", tax],
  ["/pricing/", pricing],
  ["/contact/", contact],
  ["/about/", about],
  ["/terms/", terms],
  ["/privacy/", privacy],
  ["/refund/", refund],
  ["/login/", login],
  ["/register/", register],
] as const)("%s publishes its own og:url, canonical and og:title", (path, m) => {
  expect(m.alternates?.canonical).toBe(path);
  expect(og(m).url).toBe(path);
  expect(og(m).title).toBe(`${m.title} · Allyouneed`);
  expect(typeof m.description).toBe("string");
  expect(og(m).images).toEqual([ogImage]);
});

test("login and register keep noindex", () => {
  for (const m of [login, register]) expect(m.robots).toEqual({ index: false, follow: false });
});

test("the home page points og:url and canonical at / with the full brand title", () => {
  const title = "Allyouneed — Everything your business runs on. One OS.";
  expect(home.alternates?.canonical).toBe("/");
  expect(og(home).url).toBe("/");
  expect(og(home).title).toBe(title);
  expect(tw(home).title).toBe(title);
  expect(og(home).images).toEqual([ogImage]);
  expect(home.title).toEqual({ absolute: title });
});

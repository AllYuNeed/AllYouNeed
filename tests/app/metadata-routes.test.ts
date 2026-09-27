import { test, expect } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import manifest from "@/app/manifest";
import { site } from "@/content/site";

const routes = ["/", "/features/", "/tax-compliance/", "/pricing/", "/contact/", "/about/", "/terms/", "/privacy/", "/refund/"];

test("sitemap lists every public route (not login/register)", () => {
  const urls = sitemap().map((e) => e.url);
  for (const r of routes) expect(urls).toContain(`${site.url}${r}`);
  expect(urls.some((u) => u.includes("/login"))).toBe(false);
  expect(urls.some((u) => u.includes("/register"))).toBe(false);
});

test("robots allows crawling and points at the sitemap", () => {
  const r = robots();
  expect(r.sitemap).toBe(`${site.url}/sitemap.xml`);
  expect(JSON.stringify(r.rules)).toContain('"allow":"/"');
});

test("robots does not disallow login/register, so crawlers can read their noindex", () => {
  const rules = JSON.stringify(robots().rules);
  expect(rules).not.toContain("disallow");
  expect(rules).not.toMatch(/login|register/);
});

test("manifest has the brand name, colors and PNG icons", () => {
  const mf = manifest();
  expect(mf.name).toBe("Allyouneed");
  expect(mf.theme_color).toBe("#534AB7");
  expect(mf.icons?.map((i) => i.src)).toEqual(["/brand/icon-192.png", "/brand/icon-512.png"]);
});

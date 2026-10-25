import { describe, test, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { render, screen, within } from "@testing-library/react";
import { termsDoc, privacyDoc, refundDoc } from "@/content/legal";
import { stats, statsArePlaceholder, trustLogos } from "@/content/stats";
import { testimonials } from "@/content/testimonials";
import { site } from "@/content/site";
import { about } from "@/content/about";
import { modules } from "@/content/modules";
import { TrustBar } from "@/components/sections/TrustBar";
import { Testimonials } from "@/components/sections/Testimonials";
import { Footer } from "@/components/layout/Footer";
import ContactPage from "@/app/contact/page";

// Until real figures, customers, quotes and contact details are supplied, the site must not invent them:
// placeholders are generic and visibly labelled.

const INVENTED = /Meridian|Kaveri|Nimbus|Arka Dental|Suryodaya|Lumen Retail|Trident|Pratham|Bluefin|Vasant|Rhea|Kulkarni|Arjun Mehta|Shalini|Iyer/i;

describe("statistics", () => {
  test("only the module count is a number (it is real); every other figure is a placeholder", () => {
    for (const s of stats) {
      if (/modules/i.test(s.label)) expect(s.value).toBe(modules.length);
      else expect(s.value, s.label).toBeNull();
    }
    expect(statsArePlaceholder).toBe(true);
  });

  test("the trust bar shows XX for them and says they are placeholders", () => {
    render(<TrustBar />);
    expect(screen.getAllByText(/^XX[+%]$/)).toHaveLength(3);
    expect(screen.getByText(/figures marked xx are placeholders/i)).toBeInTheDocument();
    expect(screen.getByText("Modules, one login")).toBeInTheDocument(); // the one real figure keeps its counter
    expect(document.body.textContent).not.toMatch(/\b(200|40K|99\.9)\b/);
  });

  test("customer logos are generic labels, not real-sounding companies", () => {
    expect(trustLogos.length).toBeGreaterThanOrEqual(8);
    for (const name of trustLogos) expect(name).toMatch(/^Customer name \d+$/);
  });
});

describe("testimonials", () => {
  test("are labelled placeholders with no invented people, companies or praise", () => {
    expect(testimonials).toHaveLength(3);
    for (const t of testimonials) {
      expect(t.quote).toMatch(/placeholder/i);
      expect(t.name).toMatch(/^Customer name \d$/);
      expect(`${t.quote} ${t.name} ${t.company}`).not.toMatch(INVENTED);
    }
  });

  test("the section renders them without crashing on duplicate quotes", () => {
    render(<Testimonials />);
    expect(screen.getAllByText(/testimonial placeholder/i)).toHaveLength(3);
    expect(screen.getByText("Customer name 2")).toBeInTheDocument();
  });
});

describe("contact details", () => {
  test("are placeholders that cannot reach a real inbox or phone", () => {
    expect(site.contactIsPlaceholder).toBe(true);
    expect(site.email).toMatch(/@example\.com$/);
    expect(site.phone).toMatch(/^\+91 0+ 0+$|^\+91 00000 00000$/);
    expect(site.address).toMatch(/to be supplied/i);
  });

  test("the contact page labels email, phone and address as placeholders, but not the office hours", () => {
    render(<ContactPage />);
    const card = screen.getByRole("heading", { name: /reach us directly/i }).closest("div")!;
    expect(within(card).getAllByText("Placeholder")).toHaveLength(3);
    expect(within(card).getByText("9:00 AM to 8:00 PM IST")).toBeInTheDocument();
    const hours = within(card).getByText("9:00 AM to 8:00 PM IST").closest("li")!;
    expect(within(hours).queryByText("Placeholder")).not.toBeInTheDocument();
  });

  test("the footer labels them too", () => {
    render(<Footer />);
    expect(screen.getByText("Placeholder")).toBeInTheDocument();
  });
});

describe("no invented customers or performance claims remain on the pages", () => {
  test("about copy has no invented history, customer sectors, or uptime / data-centre figures", () => {
    const text = JSON.stringify([about.story, about.security.map((s) => [s.title, s.body])]);
    expect(text).not.toMatch(/40-person|manufacturing business|retail, manufacturing|99\.9|AES-256|Indian data centres/i);
    expect(about.story.filter((p) => /^Placeholder/.test(p))).toHaveLength(2);
  });
});

describe("no invented performance figures or foreign-domain addresses anywhere in content/", () => {
  const files = (dir: string): string[] =>
    readdirSync(join(process.cwd(), dir)).flatMap((n) => {
      const rel = join(dir, n);
      return statSync(join(process.cwd(), rel)).isDirectory() ? files(rel) : /\.tsx?$/.test(n) ? [rel] : [];
    });
  const code = (f: string) => readFileSync(join(process.cwd(), f), "utf8").split("\n").filter((l) => !/^\s*\/\//.test(l)).join("\n");

  test("no uptime percentages, 24x7 promises, or 'N+' customer / accountant counts", () => {
    const offenders = files("content").filter((f) => /99\.9|24×7|24x7|\b\d{2,}\+\s*(chartered|organisations|customers|businesses|employees)/i.test(code(f)));
    expect(offenders).toEqual([]);
  });

  test("the only allyouneed.in address in content/ is the (placeholder) site url, never a mailbox", () => {
    const offenders = files("content").filter((f) => /[\w.-]+@allyouneed\.in/.test(code(f)));
    expect(offenders).toEqual([]);
  });

  test("the legal pages take their contact address from site.email", () => {
    for (const doc of [termsDoc, privacyDoc, refundDoc]) {
      const text = JSON.stringify(doc.sections);
      expect(text).toContain(site.email);
    }
  });

  test("the testimonials section says its quotes are placeholders", () => {
    render(<Testimonials />);
    expect(screen.getByText(/placeholder testimonials/i)).toBeInTheDocument();
  });
});

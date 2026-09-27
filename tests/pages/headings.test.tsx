import { describe, test, expect } from "vitest";
import { render } from "@testing-library/react";
import HomePage from "@/app/page";
import FeaturesPage from "@/app/features/page";
import TaxPage from "@/app/tax-compliance/page";
import PricingPage from "@/app/pricing/page";
import ContactPage from "@/app/contact/page";
import AboutPage from "@/app/about/page";
import LoginPage from "@/app/login/page";
import RegisterPage from "@/app/register/page";

const pages: [string, () => React.ReactNode][] = [
  ["/", HomePage],
  ["/features/", FeaturesPage],
  ["/tax-compliance/", TaxPage],
  ["/pricing/", PricingPage],
  ["/contact/", ContactPage],
  ["/about/", AboutPage],
  ["/login/", LoginPage],
  ["/register/", RegisterPage],
];

describe("heading outline", () => {
  test.each(pages)("%s starts at its h1 and never skips a level", (_, Page) => {
    const { container } = render(<Page />);
    const outline = [...container.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((h) => ({ level: Number(h.tagName[1]), text: h.textContent?.trim() }));
    expect(outline[0], "the first heading in DOM order").toMatchObject({ level: 1 });
    const skips = outline.flatMap((h, i) => (i > 0 && h.level > outline[i - 1].level + 1 ? [`h${outline[i - 1].level} "${outline[i - 1].text}" -> h${h.level} "${h.text}"`] : []));
    expect(skips).toEqual([]);
  });
});

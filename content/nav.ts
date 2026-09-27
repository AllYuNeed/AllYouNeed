export type NavLink = { label: string; href: string };

export const mainNav: NavLink[] = [
  { label: "Features", href: "/features/" },
  { label: "Tax & Compliance", href: "/tax-compliance/" },
  { label: "Pricing", href: "/pricing/" },
  { label: "About", href: "/about/" },
  { label: "Contact", href: "/contact/" },
];

export const footerColumns: { title: string; links: NavLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features/" },
      { label: "Tax & Compliance", href: "/tax-compliance/" },
      { label: "Pricing", href: "/pricing/" },
      { label: "Log in", href: "/login/" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about/" },
      { label: "Contact", href: "/contact/" },
      { label: "Book a demo", href: "/contact/" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms & Conditions", href: "/terms/" },
      { label: "Privacy Policy", href: "/privacy/" },
      { label: "Refund Policy", href: "/refund/" },
    ],
  },
];

// Phrased as alignment, not certification — see spec §8.
export const compliance: { code: string; label: string }[] = [
  { code: "DPDP 2023", label: "Digital Personal Data Protection Act, India" },
  { code: "IT Act §43A", label: "Reasonable security practices" },
  { code: "GDPR", label: "EU Regulation 2016/679" },
  { code: "ISO 27001", label: "Information security management" },
  { code: "SOC 2", label: "Security & availability controls" },
];

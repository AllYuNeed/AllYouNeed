// PLACEHOLDER — not a real number; replace with the real one and set contactIsPlaceholder to false.
const phone = "+91 00000 00000";

export const site = {
  name: "Allyouneed",
  legalName: "Allyouneed Technologies Private Limited", // PLACEHOLDER
  tagline: "Everything your business runs on. One OS.",
  description:
    "HR, payroll, accounting, CRM, inventory, projects and GST filing for growing Indian businesses. One login, one source of truth.",
  url: "https://allyouneed.in", // PLACEHOLDER — real domain goes here
  // PLACEHOLDER — example.com is reserved and can never reach a real inbox; replace with the real address.
  email: "hello@example.com",
  phone,
  /** While true, the email, phone and address are shown with a visible "Placeholder" label. Set to false once they are real. */
  contactIsPlaceholder: true,
  phoneHref: `tel:+${phone.replace(/\D/g, "")}`, // derived, so editing `phone` keeps the tel: link in step
  address: "Office address to be supplied", // PLACEHOLDER
  hours: "9:00 AM to 8:00 PM IST",
  social: {
    linkedin: "https://www.linkedin.com/company/allyouneed", // PLACEHOLDER
    x: "https://x.com/allyouneed", // PLACEHOLDER
    youtube: "https://www.youtube.com/@allyouneed", // PLACEHOLDER
  },
} as const;

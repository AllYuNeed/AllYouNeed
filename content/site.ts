const phone = "+91 80 4711 0000"; // PLACEHOLDER

export const site = {
  name: "Allyouneed",
  legalName: "Allyouneed Technologies Private Limited", // PLACEHOLDER
  tagline: "Everything your business runs on. One OS.",
  description:
    "HR, payroll, accounting, CRM, inventory, projects and GST filing for growing Indian businesses. One login, one source of truth.",
  url: "https://allyouneed.in", // PLACEHOLDER — real domain goes here
  email: "hello@allyouneed.in", // PLACEHOLDER
  phone,
  phoneHref: `tel:+${phone.replace(/\D/g, "")}`, // derived, so editing `phone` keeps the tel: link in step
  address: "4th Floor, 100 Feet Road, Indiranagar, Bengaluru 560038", // PLACEHOLDER
  hours: "Monday to Saturday, 9:30 am to 6:30 pm IST", // PLACEHOLDER
  social: {
    linkedin: "https://www.linkedin.com/company/allyouneed", // PLACEHOLDER
    x: "https://x.com/allyouneed", // PLACEHOLDER
    youtube: "https://www.youtube.com/@allyouneed", // PLACEHOLDER
  },
} as const;

export type Testimonial = { quote: string; name: string; role: string; company: string; initials: string };

// PLACEHOLDER — fictional testimonials; replace with real, permissioned quotes.
export const testimonials: Testimonial[] = [
  {
    quote:
      "We closed our first month-end in two days instead of two weeks. Payroll, GST and the books finally agree with each other.",
    name: "Rhea Kulkarni",
    role: "Co-founder",
    company: "Meridian Foods",
    initials: "RK",
  },
  {
    quote:
      "Leads from Instagram used to sit in a WhatsApp group. Now they're in a pipeline with owners, and our follow-up time dropped to under an hour.",
    name: "Arjun Mehta",
    role: "Head of Sales",
    company: "Vasant Interiors",
    initials: "AM",
  },
  {
    quote:
      "Four branches, one stock view. GSTR-1 goes out on the 9th every month without anyone touching Excel.",
    name: "Shalini Iyer",
    role: "Finance Lead",
    company: "Lumen Retail",
    initials: "SI",
  },
];

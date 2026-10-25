export type Testimonial = { quote: string; name: string; role: string; company: string; initials: string };

// PLACEHOLDER — real, permissioned customer quotes will be supplied later. Do not put invented quotes here.
const placeholderQuote = "Testimonial placeholder: a real customer quote will appear here, with their permission.";

export const testimonials: Testimonial[] = [1, 2, 3].map((n) => ({
  quote: placeholderQuote,
  name: `Customer name ${n}`,
  role: "Role",
  company: "Company",
  initials: "CN",
}));

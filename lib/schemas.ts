import { z } from "zod";

export const INDIAN_MOBILE = /^[6-9]\d{9}$/;

/** Accepts "+91 98765 43210", "098765 43210", "9876543210"; outputs 10 digits. */
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s()-]/g, "").replace(/^(\+91|91|0)(?=[6-9]\d{9}$)/, ""))
  .refine((v) => INDIAN_MOBILE.test(v), { message: "Enter a valid 10-digit Indian mobile number" });

const optionalPhone = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v.replace(/[\s()-]/g, "").replace(/^(\+91|91|0)(?=[6-9]\d{9}$)/, "") : ""))
  .refine((v) => v === "" || INDIAN_MOBILE.test(v), { message: "Enter a valid 10-digit Indian mobile number" });

// Trim/lowercase BEFORE validating: z.email().trim() would reject "  a@b.co " (verified against zod 4.6).
const email = z.string().trim().toLowerCase().pipe(z.email({ message: "Enter a valid work email" }));

const requiredText = (label: string, min = 2) =>
  z.string().trim().min(min, { message: `Enter your ${label}` });

export const teamSizes = ["1-10", "11-50", "51-200", "201-500", "500+"] as const;

export const contactSchema = z.object({
  name: requiredText("name"),
  email,
  phone: phoneSchema,
  company: requiredText("company name"),
  teamSize: z.enum(teamSizes, { message: "Choose your team size" }),
  modules: z.array(z.string()).min(1, { message: "Pick at least one module" }),
  message: z.string().trim().max(2000, { message: "Keep it under 2000 characters" }).optional().default(""),
});

export const newsletterSchema = z.object({
  email,
  phone: optionalPhone,
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, { message: "Enter your password" }),
});

export const registerSchema = z.object({
  name: requiredText("name"),
  email,
  phone: phoneSchema,
  company: requiredText("company name"),
  password: z.string().min(8, { message: "Use at least 8 characters" }),
});

// Forms use useForm<Input, unknown, Output>: Input is what the fields hold, Output is what zod hands to onSubmit after transforms.
export type ContactInput = z.input<typeof contactSchema>;
export type ContactOutput = z.output<typeof contactSchema>;
export type NewsletterInput = z.input<typeof newsletterSchema>;
export type NewsletterOutput = z.output<typeof newsletterSchema>;
export type LoginInput = z.input<typeof loginSchema>;
export type LoginOutput = z.output<typeof loginSchema>;
export type RegisterInput = z.input<typeof registerSchema>;
export type RegisterOutput = z.output<typeof registerSchema>;

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
const email = z.string().trim().toLowerCase().max(254, { message: "Enter a valid work email" }).pipe(z.email({ message: "Enter a valid work email" }));

const requiredText = (label: string, max: number, min = 2) =>
  z
    .string()
    .trim()
    .min(min, { message: `Enter your ${label}` })
    .max(max, { message: `Keep your ${label} under ${max} characters` });

export const teamSizes = ["1-10", "11-50", "51-200", "201-500", "500+"] as const;

export const contactSchema = z.object({
  name: requiredText("name", 120),
  email,
  phone: phoneSchema,
  company: requiredText("company name", 160),
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
  name: requiredText("name", 120),
  email,
  phone: phoneSchema,
  company: requiredText("company name", 160),
  password: z.string().min(8, { message: "Use at least 8 characters" }),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    // Only asked for when the visitor is changing a password they already use (not when they arrived from a reset email).
    current: z.string().optional(),
    password: z.string().min(8, { message: "Use at least 8 characters" }),
    confirm: z.string().min(1, { message: "Repeat the new password" }),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "The two passwords don't match" });

export const profileSchema = z.object({
  fullName: z.string().trim().max(120, { message: "Keep it under 120 characters" }),
  company: z.string().trim().max(160, { message: "Keep it under 160 characters" }),
  phone: optionalPhone,
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
export type ForgotPasswordInput = z.input<typeof forgotPasswordSchema>;
export type ForgotPasswordOutput = z.output<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.input<typeof resetPasswordSchema>;
export type ResetPasswordOutput = z.output<typeof resetPasswordSchema>;
export type ProfileInput = z.input<typeof profileSchema>;
export type ProfileOutput = z.output<typeof profileSchema>;

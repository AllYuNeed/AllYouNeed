import type { LucideIcon } from "lucide-react";
import { CreditCard, MessageCircle, Megaphone, Store, PhoneCall, Code } from "lucide-react";

export type Integration = { name: string; blurb: string; icon: LucideIcon };

export const integrations: Integration[] = [
  { name: "Payment gateways", blurb: "UPI, cards and net-banking receipts matched to invoices automatically.", icon: CreditCard },
  { name: "WhatsApp Business", blurb: "Invoices, payslips and reminders on the channel your customers read.", icon: MessageCircle },
  { name: "Meta lead ads", blurb: "Instagram and Facebook leads land in the CRM within seconds.", icon: Megaphone },
  { name: "Google Business & listings", blurb: "Enquiries from your profile and listing sites become leads.", icon: Store },
  { name: "Cloud telephony", blurb: "Click-to-call, IVR and call logs on the contact timeline.", icon: PhoneCall },
  { name: "REST API & webhooks", blurb: "Build your own connections or import from Tally and Excel.", icon: Code },
];

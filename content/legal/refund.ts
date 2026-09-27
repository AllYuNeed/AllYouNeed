import type { LegalDoc } from "./types";

// PLACEHOLDER — sample text. Have a lawyer review before launch.
export const refundDoc: LegalDoc = {
  title: "Refund Policy",
  updated: "2026-09-27",
  intro: "We want you to pay only for software you use. This policy explains when subscription fees are refunded.",
  sections: [
    { heading: "1. Free trial", body: ["Paid plans start with a 14-day free trial. You will not be charged until the trial ends, and you can cancel any time during the trial without charge."] },
    { heading: "2. Monthly plans", body: ["Monthly subscriptions can be cancelled any time and remain active until the end of the paid month. Fees for the current month are not refunded, and no further charges are made."] },
    { heading: "3. Yearly plans", body: ["Yearly subscriptions cancelled within 30 days of the first payment are refunded in full. After 30 days we refund the unused whole months remaining, less the discount received compared with monthly pricing."] },
    { heading: "4. Professional services", body: ["Fees for filings, audits or advisory delivered by professionals from our network are refundable only if the work has not started. Government fees and penalties are never refundable."] },
    { heading: "5. Service failures", body: ["If we miss our uptime commitment in a month, you may request a service credit as described in your plan's SLA."] },
    { heading: "6. How to request a refund", body: ["Email billing@allyouneed.in from your registered address with your organisation name and invoice number. Approved refunds are processed to the original payment method within 7–10 working days."] },
  ],
};

import type { LegalDoc } from "./types";

// PLACEHOLDER — sample text. Have a lawyer review before launch.
export const termsDoc: LegalDoc = {
  title: "Terms & Conditions",
  updated: "2026-09-27",
  intro: "These terms govern your use of the Allyouneed platform, website and mobile applications (the \"Service\") provided by Allyouneed Technologies Private Limited (\"Allyouneed\", \"we\").",
  sections: [
    { heading: "1. Acceptance", body: ["By creating an account or using the Service you agree to these terms on behalf of yourself and the organisation you represent. If you do not agree, do not use the Service."] },
    { heading: "2. Accounts and access", body: ["You are responsible for keeping login credentials confidential and for all activity under your account. Notify us immediately of any unauthorised use.", "Administrators may invite users and set permissions; the organisation is responsible for its users' actions."] },
    { heading: "3. Subscriptions and payment", body: ["Paid plans are billed monthly or yearly in advance in Indian Rupees, exclusive of applicable GST. Prices may change with 30 days' notice; changes apply from your next billing cycle.", "Free plans may be limited in users, modules or storage as described on the pricing page."] },
    { heading: "4. Your data", body: ["You retain ownership of the data you enter. You grant us a licence to process it only to provide, secure and improve the Service. You can export your data at any time in standard formats.", "We process personal data in accordance with our Privacy Policy and the Digital Personal Data Protection Act, 2023."] },
    { heading: "5. Compliance filings", body: ["Returns and filings prepared by the Service are based on the data you enter and require your review and confirmation before submission. You remain responsible for the accuracy and timeliness of your statutory filings. Professional services from our partner network are governed by separate engagement terms."] },
    { heading: "6. Acceptable use", body: ["You may not use the Service to violate any law, infringe intellectual property, transmit malware, or attempt to access other customers' data. We may suspend accounts that pose a security or legal risk."] },
    { heading: "7. Availability and support", body: ["We aim for 99.9% monthly uptime, excluding scheduled maintenance announced in advance. Support channels and response targets depend on your plan."] },
    { heading: "8. Limitation of liability", body: ["To the extent permitted by law, our total liability for any claim arising from the Service is limited to the fees paid by you in the twelve months preceding the claim. We are not liable for indirect or consequential losses, including penalties arising from late or inaccurate filings caused by data you provided."] },
    { heading: "9. Termination", body: ["You may cancel at any time from account settings. We may terminate for material breach with notice. On termination you retain read-only access for 90 days to export your data, after which it is deleted per our retention schedule."] },
    { heading: "10. Governing law", body: ["These terms are governed by the laws of India. Courts in Bengaluru, Karnataka have exclusive jurisdiction, subject to arbitration under the Arbitration and Conciliation Act, 1996 where applicable."] },
    { heading: "11. Contact", body: ["Questions about these terms: legal@allyouneed.in."] },
  ],
};

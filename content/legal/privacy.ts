import type { LegalDoc } from "./types";

// PLACEHOLDER — sample text. Have a lawyer review before launch.
export const privacyDoc: LegalDoc = {
  title: "Privacy Policy",
  updated: "2026-09-27",
  intro: "This policy explains what personal data Allyouneed collects, why, and the rights you have under the Digital Personal Data Protection Act, 2023 (DPDP Act) and, where applicable, the GDPR.",
  sections: [
    { heading: "1. Who we are", body: ["Allyouneed Technologies Private Limited, Bengaluru, is the Data Fiduciary for data about our website visitors and account holders. For data your organisation enters about its employees, customers and vendors, your organisation is the Data Fiduciary and we act as a Data Processor on its instructions."] },
    { heading: "2. Data we collect", body: ["Account data: name, work email, phone, company and role.", "Usage data: pages viewed, features used, device and browser information, IP address.", "Business data you enter: employee, customer, vendor and financial records needed to provide the Service.", "Support data: messages you send us and call recordings where notified."] },
    { heading: "3. Why we process it", body: ["To provide and secure the Service, bill you, respond to support requests, send service notices, and improve features. Marketing emails are sent only with consent and include an unsubscribe link."] },
    { heading: "4. Legal basis and consent", body: ["We process personal data with your consent or for legitimate uses permitted under the DPDP Act, such as performing a contract you have entered into. You may withdraw consent at any time; this does not affect processing already carried out."] },
    { heading: "5. Sharing", body: ["We share data with sub-processors (cloud hosting in India, email and messaging providers, payment gateways) under written contracts, with government portals when you file returns, and with professionals from our network when you engage them. We do not sell personal data."] },
    { heading: "6. Retention", body: ["Account data is retained while your account is active and for 90 days after closure. Financial records may be retained longer where required by law (for example, eight years under the Companies Act, 2013). Backups are purged on a rolling schedule."] },
    { heading: "7. Your rights", body: ["You may access, correct, update or request erasure of your personal data, nominate a person to exercise your rights, and raise a grievance. Contact our Grievance Officer at privacy@allyouneed.in; we respond within 30 days. You may escalate to the Data Protection Board of India."] },
    { heading: "8. Security", body: ["Data is encrypted in transit and at rest, access is role-based and logged, and we run regular vulnerability assessments. Our practices are designed to align with ISO 27001 and SOC 2 control frameworks."] },
    { heading: "9. Cookies", body: ["We use strictly necessary cookies for login and preferences, and analytics cookies only with consent. You can manage cookies in your browser settings."] },
    { heading: "10. Changes", body: ["We will notify account holders by email of material changes at least 15 days before they take effect."] },
  ],
};

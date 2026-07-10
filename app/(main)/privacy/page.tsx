import type { Metadata } from "next";
import { LegalPage } from "@/app/(main)/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for Squid Agent, an AI React app builder for exportable code.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updatedAt="July 10, 2026"
      intro="This policy explains what Squid Agent collects, why it is used, and how product data is handled when you generate, preview, save, and export React apps."
      sections={[
        {
          title: "Information We Collect",
          body: "Squid Agent may collect account information, authentication data, project prompts, uploaded screenshots, website reference URLs, generated app files, usage events, credit transactions, and payment status needed to operate the product.",
          points: [
            "Prompts, screenshots, and generated files are used to create and maintain your projects.",
            "Billing and credit records are used to show balances, usage history, and plan status.",
            "Basic analytics may be used to understand public page traffic and product reliability.",
          ],
        },
        {
          title: "How Information Is Used",
          body: "Data is used to authenticate users, generate code, save project history, provide exports, prevent abuse, process payments, debug reliability issues, and improve the product experience.",
        },
        {
          title: "AI Providers",
          body: "Prompts, screenshots, website references, generated context, and repair context may be sent to AI infrastructure providers so Squid Agent can generate or improve app code. Avoid submitting secrets or private credentials in prompts, screenshots, or project files.",
        },
        {
          title: "Data Security",
          body: "Squid Agent uses technical and organizational safeguards intended to protect account, project, billing, and generation data. No internet service can guarantee absolute security, so users should avoid placing secrets, production credentials, regulated data, or information they are not authorized to share into prompts or project files.",
        },
        {
          title: "Payments",
          body: "Payments and subscription status are processed through Stripe. Squid Agent stores the billing identifiers and fulfillment state needed to grant credits, plans, and receipts, but does not store full card numbers.",
        },
        {
          title: "Retention and Deletion",
          body: "Project and account data may be retained while an account is active or as needed for security, billing, legal compliance, and product reliability. If deletion workflows are not available in-product, email support@squidagent.app or use the contact page.",
        },
        {
          title: "Your Choices",
          body: "You may request access, correction, export, or deletion of personal information where applicable. Some billing, fraud-prevention, security, and legal records may need to be retained after an account or project is deleted.",
          points: [
            "Review and export projects before requesting account deletion.",
            "Use the contact page from the email associated with the account when possible.",
            "Do not include passwords, API keys, or payment card details in a privacy request.",
          ],
        },
        {
          title: "Children",
          body: "Squid Agent is not directed to children under 13, and the service should not be used to knowingly submit personal information about children without appropriate authority and consent.",
        },
        {
          title: "Contact",
          body: "Privacy requests, account deletion requests, security disclosures, and legal notices can be sent to support@squidagent.app.",
        },
      ]}
    />
  );
}

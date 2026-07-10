import type { Metadata } from "next";
import { LegalPage } from "@/app/(main)/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of service for using Squid Agent to generate exportable React apps.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updatedAt="July 10, 2026"
      intro="These terms describe the baseline rules for using Squid Agent. They are written for the current product: prompt, screenshot, and website-reference generation for exportable React applications."
      sections={[
        {
          title: "Use of the Product",
          body: "You may use Squid Agent to generate, inspect, remix, save, and export React app code, subject to these terms and applicable law. You are responsible for the prompts, uploads, URLs, and generated outputs you choose to use.",
        },
        {
          title: "Accounts and Access",
          body: "You are responsible for maintaining accurate account information, protecting your sign-in methods, and all activity authorized through your account. Do not share access in ways that bypass plan, project, or model restrictions.",
        },
        {
          title: "Generated Code",
          body: "Squid Agent is designed to provide exportable source code, but generated output should be reviewed before production use. You are responsible for validating security, accessibility, dependency, license, and deployment requirements for your own project.",
        },
        {
          title: "Credits and Billing",
          body: "Credits, subscriptions, and purchases are used to access generation capacity and paid models. The product aims to show model cost before generation and record successful usage after work is saved, but availability, model pricing, and provider behavior may change.",
        },
        {
          title: "Third-Party Services",
          body: "Generated projects and Squid Agent workflows may rely on AI providers, payment processors, hosting platforms, libraries, websites, and other third-party services. Their availability, pricing, licenses, and terms are outside Squid Agent's control and may change.",
        },
        {
          title: "Prohibited Use",
          body: "Do not use Squid Agent to submit secrets you are not authorized to share, attack systems, infringe rights, generate unlawful content, bypass access controls, abuse infrastructure, or interfere with the service for other users.",
        },
        {
          title: "No Warranty",
          body: "Squid Agent is provided as-is. AI-generated code can contain errors, incomplete behavior, insecure patterns, or unavailable dependencies. Review and test outputs before relying on them.",
        },
        {
          title: "Changes and Availability",
          body: "Features, models, credit requirements, plan limits, and integrations may change as providers and the product evolve. Material policy updates will be reflected by the date shown on this page.",
        },
        {
          title: "Contact",
          body: "Questions about these terms, billing, acceptable use, legal notices, or account issues can be sent to support@squidagent.app.",
        },
      ]}
    />
  );
}

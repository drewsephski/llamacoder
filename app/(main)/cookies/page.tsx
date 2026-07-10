import type { Metadata } from "next";
import { LegalPage } from "@/app/(main)/legal-page";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Cookie policy for Squid Agent authentication, preferences, analytics, and billing flows.",
  alternates: {
    canonical: "/cookies",
  },
};

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      updatedAt="July 10, 2026"
      intro="This page explains how Squid Agent uses cookies and similar browser storage for sign-in, preferences, product operation, analytics, and billing-related flows."
      sections={[
        {
          title: "Essential Cookies",
          body: "Essential cookies and local storage keep users signed in, support secure authentication, remember product state, and make protected pages such as dashboards and project chats work correctly.",
        },
        {
          title: "Preference Storage",
          body: "Squid Agent may store interface preferences such as theme, onboarding state, and other local settings that improve the app experience on return visits.",
        },
        {
          title: "Analytics",
          body: "The public site may use privacy-conscious analytics to understand traffic and page performance. These signals help improve SEO surfaces, onboarding, and product reliability.",
        },
        {
          title: "Local Project State",
          body: "The browser may store non-sensitive interface and workflow state needed to keep previews, theme choices, dialogs, or in-progress interactions consistent. Clearing browser storage can reset these local preferences without deleting server-side account projects.",
        },
        {
          title: "Billing and Third Parties",
          body: "Stripe and other service providers may use cookies or similar technologies during checkout, subscription management, fraud prevention, and payment confirmation.",
        },
        {
          title: "Managing Cookies",
          body: "You can block or delete cookies in your browser settings. Blocking essential cookies may prevent sign-in, checkout, dashboard access, project creation, or saved preferences from working.",
        },
        {
          title: "Policy Updates",
          body: "Cookie and storage behavior may change when authentication, analytics, billing, or product providers change. The date above identifies the latest policy review.",
        },
        {
          title: "Contact",
          body: "Cookie, analytics, privacy, and account questions can be sent to support@squidagent.app.",
        },
      ]}
    />
  );
}

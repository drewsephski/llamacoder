import { LegalPage } from "@/app/(main)/legal-page";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Cookie Policy",
  description:
    "Cookie policy for Squid Agent authentication, preferences, analytics, and billing flows.",
  path: "/cookies",
  keywords: ["Squid Agent cookie policy"],
});

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      updatedAt="July 27, 2026"
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
          body: "Squid Agent uses privacy-conscious analytics to understand traffic, page performance, onboarding, and product reliability. Plausible Analytics provides site and product measurements. Selected public acquisition pages also use Ahrefs Web Analytics, configured without cookies and without query strings. Ahrefs measures aggregate page views and may automatically measure outbound link clicks and eligible form submissions on those public pages.",
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

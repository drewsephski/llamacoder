import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bug,
  CreditCard,
  Github,
  Instagram,
  Mail,
  MessageSquareText,
  ShieldAlert,
} from "lucide-react";
import {
  MarketingFooter,
  MarketingHeader,
} from "@/components/marketing-chrome";

const contactEmail = "support@squidagent.app";

export const metadata: Metadata = {
  title: "Contact and Support",
  description:
    "Contact Squid Agent for product support, billing and credit questions, privacy requests, security reports, legal notices, and React export feedback.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Squid Agent",
    description:
      "Get help with projects, exports, billing, privacy, security, or product feedback.",
    url: "/contact",
    type: "website",
  },
};

const supportTopics = [
  {
    icon: Bug,
    title: "Project or export issue",
    body: "Include the project URL, what you expected, what happened, browser details, and any visible error text. Never send API keys or private credentials.",
  },
  {
    icon: CreditCard,
    title: "Billing or credits",
    body: "Include the account email, approximate time, plan or credit pack, and the relevant usage-ledger row or checkout receipt identifier.",
  },
  {
    icon: ShieldAlert,
    title: "Privacy or security",
    body: "State whether the request involves access, deletion, a suspected vulnerability, or a legal notice. Sensitive security details should not be posted publicly.",
  },
  {
    icon: MessageSquareText,
    title: "Product feedback",
    body: "Share the job you were trying to complete, where the workflow became confusing, and what outcome would have been more useful.",
  },
];

export default function ContactPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Squid Agent",
    url: "https://squidagent.app/contact",
    mainEntity: {
      "@type": "Organization",
      name: "Squid Agent",
      email: contactEmail,
      url: "https://squidagent.app",
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main>
        <header className="border-b border-border">
          <div className="mx-auto grid max-w-6xl items-end gap-10 px-6 py-16 lg:grid-cols-[1fr_340px] lg:px-8 lg:py-24">
            <div>
              <h1 className="text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                Tell us what happened. We&apos;ll help route it.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9">
                Get help with a project, generation, export, credit charge,
                privacy request, security report, or product question.
              </p>
            </div>
            <a
              href={`mailto:${contactEmail}`}
              className="group border-l-2 border-primary pl-5"
            >
              <span className="text-sm text-muted-foreground">
                Primary support email
              </span>
              <span className="mt-2 flex items-center gap-2 font-semibold text-primary">
                {contactEmail}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </a>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="grid border-l border-t border-border sm:grid-cols-2">
            {supportTopics.map((topic) => {
              const Icon = topic.icon;
              return (
                <article
                  key={topic.title}
                  className="border-b border-r border-border p-7 sm:p-9"
                >
                  <Icon className="size-5 text-primary" aria-hidden="true" />
                  <h2 className="mt-6 text-xl font-semibold tracking-tight">
                    {topic.title}
                  </h2>
                  <p className="mt-3 leading-7 text-muted-foreground">
                    {topic.body}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="border-y border-border bg-muted/25">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1fr_1fr] lg:px-8">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Before you email
              </h2>
              <p className="mt-3 leading-7 text-muted-foreground">
                Check the usage ledger for generation charges and try a clean
                local install for export issues. Those two artifacts usually
                make diagnosis much faster.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/dashboard/usage"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  View usage ledger <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/blog/how-to-export-ai-generated-react-app"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  Export checklist <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
            <div className="border-l-2 border-primary pl-6">
              <h2 className="font-semibold">
                Keep secrets out of support messages
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Do not send passwords, session cookies, payment card data,
                database credentials, provider keys, or private customer data.
                Redact screenshots and logs before attaching them.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-14 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Public profiles</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Follow product work publicly; use email for account-specific
                support.
              </p>
            </div>
            <div className="flex gap-3">
              <SocialLink
                href="https://github.com/drewsephski"
                label="GitHub"
                icon={Github}
              />
              <SocialLink
                href="https://www.instagram.com/drew.sepeczi"
                label="Instagram"
                icon={Instagram}
              />
              <SocialLink
                href={`mailto:${contactEmail}`}
                label="Email"
                icon={Mail}
                external={false}
              />
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

function SocialLink({
  href,
  label,
  icon: Icon,
  external = true,
}: {
  href: string;
  label: string;
  icon: typeof Github;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:border-primary/50 hover:text-primary"
    >
      <Icon className="size-4" aria-hidden="true" />
      {label}
    </a>
  );
}

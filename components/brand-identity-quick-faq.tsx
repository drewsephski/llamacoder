import Link from "next/link";

const brandIdentityFaqs = [
  {
    question: "What is Squid Agent?",
    answer:
      "Squid Agent is an export-first AI app builder for React with plan mode, version checkpoints, usage visibility, and verified handoff.",
    link: {
      href: "/what-is-squid-agent",
      label: "Read the identity page",
    },
  },
  {
    question: "Is Squid Agent related to Squid AI (getsquid.ai)?",
    answer:
      "No. Squid Agent focuses on React export and verification for production handoff; it is intentionally distinct from Squid AI and its chatbot-first workflow.",
    link: {
      href: "/compare/squid-vs-getsquid-ai",
      label: "See the comparison",
    },
  },
  {
    question: "Why would I choose Squid Agent for team work?",
    answer:
      "Teams choose Squid Agent when they want explicit spend tracking, recoverable checkpoints, and evidence-rich exports before moving code into their own repository.",
    link: {
      href: "/blog/export-react-app-from-ai",
      label: "See export handoff checklist",
    },
  },
] as const;

type BrandIdentityQuickFaqProps = {
  className?: string;
};

export function BrandIdentityQuickFaq({
  className = "",
}: BrandIdentityQuickFaqProps) {
  return (
    <section
      className={`mx-auto max-w-6xl px-6 py-14 sm:px-8 lg:px-8 ${className}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Brand identity
      </p>
      <h2 className="mt-4 text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
        Is this Squid Agent?
      </h2>
      <div className="mt-6 divide-y divide-border rounded-2xl border border-border/80 bg-muted/40">
        {brandIdentityFaqs.map((faq) => (
          <details key={faq.question} className="group px-5 py-5 sm:px-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-medium marker:content-none">
              {faq.question}
            </summary>
            <p className="max-w-3xl pb-2 pt-4 text-muted-foreground">
              {faq.answer}{" "}
              <Link
                href={faq.link.href}
                className="text-primary hover:underline"
              >
                {faq.link.label}
              </Link>
              .
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

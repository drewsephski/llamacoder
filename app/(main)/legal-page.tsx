import { Check, Mail, ShieldCheck } from "lucide-react";
import {
  MarketingFooter,
  MarketingHeader,
} from "@/components/marketing-chrome";

type LegalSection = {
  title: string;
  body: string;
  points?: string[];
};

type LegalPageProps = {
  title: string;
  updatedAt: string;
  intro: string;
  sections: LegalSection[];
};

export function LegalPage({
  title,
  updatedAt,
  intro,
  sections,
}: LegalPageProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingHeader />
      <main>
        <header className="border-b border-border">
          <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-20">
            <div className="grid items-end gap-10 lg:grid-cols-[1fr_320px]">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <ShieldCheck className="size-4" aria-hidden="true" />
                  Product policy
                </div>
                <h1 className="mt-6 text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                  {title}
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
                  {intro}
                </p>
              </div>
              <div className="border-l-2 border-primary pl-5 text-sm leading-6 text-muted-foreground">
                <span className="font-semibold text-foreground">
                  Last updated
                </span>
                <span className="mt-1 block">{updatedAt}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-6xl gap-14 px-6 py-16 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
          <aside>
            <nav aria-label="Policy sections" className="sticky top-28">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                On this page
              </p>
              <ul className="mt-4 border-l border-border">
                {sections.map((section) => (
                  <li key={section.title}>
                    <a
                      href={`#${sectionId(section.title)}`}
                      className="-ml-px block border-l border-transparent py-2 pl-4 text-sm leading-5 text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <article className="min-w-0 divide-y divide-border border-y border-border">
            {sections.map((section, index) => (
              <section
                id={sectionId(section.title)}
                key={section.title}
                className="scroll-mt-28 py-10 sm:py-12"
              >
                <div className="grid gap-4 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-6">
                  <span className="font-mono text-sm text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight">
                      {section.title}
                    </h2>
                    <p className="mt-4 leading-8 text-muted-foreground">
                      {section.body}
                    </p>
                    {section.points && (
                      <ul className="mt-6 grid gap-3">
                        {section.points.map((point) => (
                          <li
                            key={point}
                            className="flex gap-3 leading-7 text-foreground/85"
                          >
                            <Check
                              className="mt-1.5 size-4 shrink-0 text-primary"
                              aria-hidden="true"
                            />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </section>
            ))}
          </article>
        </div>

        <section className="border-y border-primary/20 bg-primary/[0.045]">
          <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <div>
              <h2 className="font-semibold">Questions or formal requests?</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Include the email tied to your account and enough context to
                route your request safely.
              </p>
            </div>
            <a
              href="mailto:support@squidagent.app"
              className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
            >
              <Mail className="size-4" aria-hidden="true" />
              support@squidagent.app
            </a>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

function sectionId(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

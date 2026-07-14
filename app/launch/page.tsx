import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Code2, Download, FlaskConical } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Build, verify, and own your app | Squid Agent",
  description:
    "A launch-day path for seeing Squid Agent's complete prompt-to-portable-source workflow before creating an account.",
};

const proof = [
  {
    icon: Code2,
    title: "Inspect the source",
    body: "Every generated file stays visible and editable in the workspace.",
  },
  {
    icon: FlaskConical,
    title: "See the evidence",
    body: "Static, runtime, and export verification are reported separately.",
  },
  {
    icon: Download,
    title: "Take it with you",
    body: "Download a portable React project with run and deploy configuration.",
  },
];

export default function LaunchPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:py-24">
        <div>
          <Link href="/" className="text-sm font-medium text-cyan-300">
            Squid Agent
          </Link>
          <p className="mt-8 text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
            Product Hunt launch
          </p>
          <h1 className="mt-4 text-5xl font-semibold leading-[0.98] tracking-tight sm:text-6xl">
            From prompt to React source you own.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            Watch the real workflow, inspect a complete project without signing
            up, then build with five verified-account starter credits.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="bg-cyan-300 text-slate-950 hover:bg-cyan-200"
            >
              <Link href="/example">
                Inspect the public workspace <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/sign-up">Build your own</Link>
            </Button>
          </div>
          <p className="mt-4 flex items-center gap-2 text-sm text-slate-400">
            <Check className="size-4 text-emerald-400" /> No credit card
            required
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl shadow-cyan-500/10">
          <video
            src="/product-hunt/squid-agent-launch-60s.mp4"
            controls
            preload="metadata"
            poster="/showcase/portfolio-os.png"
            className="aspect-video w-full"
          >
            Your browser does not support the launch video.
          </video>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.03]">
        <div className="mx-auto grid max-w-7xl gap-4 px-6 py-12 md:grid-cols-3">
          {proof.map(({ icon: Icon, title, body }, index) => (
            <article
              key={title}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"
            >
              <div className="flex items-center justify-between">
                <Icon className="size-5 text-cyan-300" />
                <span className="font-mono text-xs text-slate-500">
                  0{index + 1}
                </span>
              </div>
              <h2 className="mt-8 text-xl font-medium">{title}</h2>
              <p className="mt-2 leading-7 text-slate-400">{body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

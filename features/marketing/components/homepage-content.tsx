import Image from "next/image";
import { ExternalLink } from "lucide-react";
import HoverBrandLogo from "@/components/ui/hover-brand-logo";
import Footer from "@/components/footer";
import { Macbook } from "@/components/ui/animated-3d-mac-book-air";

type BuiltWithSquidProject = {
  name: string;
  href: string;
  description: string;
  category: string;
  creatorName?: string;
  featured?: boolean;
  imageSrc?: string;
  imageAlt?: string;
  preview?: string;
  gradient?: string;
};

const BUILT_WITH_SQUID_PROJECTS: readonly BuiltWithSquidProject[] = [
  {
    name: "Phoenix Design Lab",
    href: "https://phoenixdev.agency/demo",
    description:
      "A cinematic agency landing page with a red editorial art direction and bold one-screen positioning.",
    category: "Design agency",
    imageSrc: "/showcase/phoenix-design-lab.webp",
    imageAlt: "Phoenix Design Lab homepage generated with Squid",
    preview: "Phoenix Design Lab",
    featured: true,
  },
  {
    name: "PortfolioOS",
    href: "https://portfolios.chat",
    description:
      "An AI-native professional identity site where portfolios answer questions in real time.",
    category: "AI portfolio builder",
    imageSrc: "/showcase/portfolio-os.webp",
    imageAlt: "PortfolioOS homepage generated with Squid",
    preview: "Conversational identity",
    gradient: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 48%, #f8fafc 100%)",
  },
  {
    name: "Slotflow",
    href: "https://slotflow.fit",
    description:
      "A scheduling surface for coordinating group availability without spreadsheet back-and-forth.",
    category: "Event coordination",
    imageSrc: "/showcase/slotflow.webp",
    imageAlt: "Slotflow homepage generated with Squid",
    preview: "Effortless coordination",
    gradient: "linear-gradient(135deg, #062f2f 0%, #14b8a6 50%, #f7fee7 100%)",
  },
];

const homepageFaq = [
  {
    question: "What is Squid Agent?",
    answer:
      "Squid Agent is an AI app builder for generating React applications from prompts, screenshots, and website references. It focuses on exportable source code, visible quality checks, transparent credit use, and reversible project history.",
  },
  {
    question: "Who is Squid Agent for?",
    answer:
      "Squid Agent is built for founders, builders, designers, and product teams who want to prototype full React apps quickly while keeping the generated code inspectable, editable, and portable.",
  },
  {
    question: "Can I export the code from Squid Agent?",
    answer:
      "Yes. Squid Agent is designed around code ownership. Generated projects can be downloaded with source files, project metadata, run instructions, and quality information so teams can continue work outside the product.",
  },
  {
    question: "How does Squid Agent handle AI credits?",
    answer:
      "Squid Agent shows model cost before generation and records successful usage after work is saved. The product is designed to make credit spend visible instead of hiding cost inside retries or unclear repair loops.",
  },
] as const;

const homepageNarrativeBlocks = [
  {
    label: "Input",
    side: "left",
    question: "What can you build with Squid Agent?",
    body: "Squid Agent turns plain-language product ideas, uploaded screenshots, and website references into working React apps. The product is designed for builders who want fast generation without giving up practical ownership of the result: source files, project-level context, quality signals, and export paths remain visible after the AI has finished.",
  },
  {
    label: "Ownership",
    side: "right",
    question: "How does Squid Agent keep generated code portable?",
    body: "Generated projects are treated as code artifacts, not disposable previews. Squid Agent emphasizes exportable React source, complete file structure, run instructions, and metadata that helps a developer understand what was produced and continue work in a normal development workflow.",
  },
  {
    label: "Review",
    side: "left",
    question: "Why are visible quality checks important?",
    body: "AI-generated apps can look finished while still hiding broken imports, missing dependencies, inaccessible controls, or overwritten framework files. Squid Agent surfaces quality information so teams can inspect the result before they rely on it, remix it, or export it.",
  },
  {
    label: "Credits",
    side: "right",
    question: "How does Squid Agent make AI credit use clearer?",
    body: "Squid Agent shows the selected model and expected credit cost before a generation starts. That makes the buying moment easier to understand and helps avoid the common problem of discovering spend only after retries, repairs, or failed outputs have already happened.",
  },
] as const;

export const homepageStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://squidagent.app/#organization",
      name: "Squid Agent",
      url: "https://squidagent.app/",
      logo: "https://squidagent.app/squidagent-logo.svg",
      sameAs: [
        "https://www.instagram.com/drew.sepeczi",
        "https://github.com/drewsephski",
      ],
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://squidagent.app/#software",
      name: "Squid Agent",
      alternateName: "Squid",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      url: "https://squidagent.app/",
      image: "https://squidagent.app/og-image.png",
      description:
        "AI app builder for generating exportable React applications from prompts, screenshots, and website references.",
      creator: {
        "@id": "https://squidagent.app/#organization",
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        category: "Free starter plan",
      },
      featureList: [
        "Prompt-to-React app generation",
        "Screenshot-to-code generation",
        "Website reference capture",
        "Exportable source code",
        "Transparent AI credit pricing",
        "Reversible project versions",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://squidagent.app/#website",
      name: "Squid Agent",
      url: "https://squidagent.app/",
      publisher: {
        "@id": "https://squidagent.app/#organization",
      },
    },
    {
      "@type": "FAQPage",
      "@id": "https://squidagent.app/#faq",
      mainEntity: homepageFaq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ],
};

/** Derives a clean, display-friendly URL for the browser-chrome mockups. */
function getDisplayPreviewUrl(href: string) {
  try {
    const url = new URL(href);
    const pathname = url.pathname === "/" ? "" : url.pathname;

    return `${url.protocol}//${url.hostname.replace(/^www\./, "")}${pathname}`;
  } catch {
    return href;
  }
}

export function HomepageStyles() {
  return (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=JetBrains+Mono:wght@400;500&display=swap');

        .font-display { font-family: 'Instrument Serif', Georgia, serif; }
        .font-sans-dm { font-family: 'DM Sans', system-ui, sans-serif; }
        .font-mono-jb { font-family: 'JetBrains Mono', ui-monospace, monospace; }
        body[data-scroll-locked] { margin-right: 0 !important; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
          50% { box-shadow: 0 0 0 6px rgba(59,130,246,0.06); }
        }
        @keyframes floatDot {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.4; }
          50% { transform: translateY(-8px) scale(1.1); opacity: 0.7; }
        }
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(59,130,246,0.2); }
          50% { border-color: rgba(59,130,246,0.5); }
        }
        @keyframes livePulse {
          0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.55); }
          70% { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
        @keyframes meshDrift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-2%, 2%) scale(1.05); }
        }

        .animate-fade-up { animation: fadeUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .animate-fade-up-1 { animation: fadeUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.05s both; }
        .animate-fade-up-2 { animation: fadeUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both; }
        .animate-fade-up-3 { animation: fadeUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.22s both; }
        .animate-fade-up-4 { animation: fadeUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.32s both; }
        .animate-fade-in { animation: fadeIn 0.8s ease both 0.4s; }

        .shimmer-text {
          background: linear-gradient(
            150deg,
            hsl(var(--foreground)) 0%,
            rgba(0, 98, 255, 1) 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer-reverse 3s linear infinite;
        }

        .compose-box {
          position: relative;
          border-radius: 20px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .compose-box::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 21px;
          padding: 1px;
          background: linear-gradient(135deg, transparent 0%, rgba(59,130,246,0.15) 50%, transparent 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .compose-box:focus-within::before { opacity: 1; }

        .compose-box-inner {
          background: hsl(var(--background) / 0.85);
          backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid hsl(var(--border) / 0.6);
          border-radius: 20px;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .compose-box-inner:focus-within {
          border-color: rgba(59,130,246,0.45);
          box-shadow:
            0 0 0 3px rgba(59,130,246,0.06),
            0 8px 32px rgba(0,0,0,0.08),
            0 2px 8px rgba(59,130,246,0.06);
        }
        .compose-box-inner:hover:not(:focus-within) {
          border-color: hsl(var(--border) / 0.9);
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        }

        .dark .compose-box-inner {
          background: hsl(var(--card) / 0.75);
        }

        .toolbar-divider {
          width: 1px;
          height: 16px;
          background: hsl(var(--border) / 0.6);
        }

        .pill-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 99px;
          border: 1px solid hsl(var(--border) / 0.5);
          background: hsl(var(--background) / 0.5);
          font-size: 12.5px;
          color: hsl(var(--muted-foreground));
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-weight: 400;
          letter-spacing: -0.01em;
          backdrop-filter: blur(8px);
        }
        .pill-chip:hover {
          border-color: rgba(59,130,246,0.35);
          background: rgba(59,130,246,0.04);
          color: hsl(var(--foreground));
          transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(59,130,246,0.08);
        }

        .url-strip {
          border-radius: 14px;
          border: 1px solid hsl(var(--border) / 0.5);
          background: hsl(var(--background) / 0.6);
          backdrop-filter: blur(12px);
          transition: all 0.25s ease;
        }
        .url-strip:focus-within {
          border-color: rgba(59,130,246,0.4);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.05);
        }

        .build-btn {
          position: relative;
          overflow: hidden;
          border-radius: 12px;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-weight: 500;
          letter-spacing: -0.01em;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .build-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%);
          pointer-events: none;
        }
        .build-btn:hover:not(:disabled) {
          transform: translateY(-1px) scale(1.02);
          box-shadow: 0 6px 20px rgba(59,130,246,0.3);
        }
        .build-btn:active:not(:disabled) {
          transform: translateY(0) scale(0.99);
        }

        .select-trigger-custom {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 450;
          color: hsl(var(--muted-foreground));
          font-family: 'DM Sans', system-ui, sans-serif;
          transition: all 0.15s ease;
          cursor: pointer;
          letter-spacing: -0.01em;
        }
        .select-trigger-custom:hover {
          background: hsl(var(--muted) / 0.7);
          color: hsl(var(--foreground));
        }

        .stat-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #22c55e;
          animation: floatDot 2.4s ease-in-out infinite;
          box-shadow: 0 0 6px rgba(34,197,94,0.5);
        }

        .screenshot-thumb {
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.15);
          transition: transform 0.2s ease;
        }
        .screenshot-thumb:hover { transform: scale(1.03); }

        .or-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          color: hsl(var(--muted-foreground) / 0.5);
          font-size: 11.5px;
          font-family: 'DM Sans', system-ui, sans-serif;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          font-weight: 500;
        }
        .or-divider::before, .or-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: hsl(var(--border) / 0.4);
        }

        .upload-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 8px;
          color: hsl(var(--muted-foreground));
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .upload-btn:hover {
          background: hsl(var(--muted) / 0.7);
          color: hsl(var(--foreground));
        }

        .info-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 99px;
          background: rgba(12,168,255,0.08);
          border: 1px solid rgba(12,168,255,0.2);
          color: #0095ff;
          font-size: 11.5px;
          font-weight: 500;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .dark .info-pill { color: #0095ff; background: rgba(12,168,255,0.06); }

        .pro-badge {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          padding: 1px 5px 1px 3px;
          border-radius: 5px;
          background: linear-gradient(120deg, rgba(59,130,246,0.16), rgba(99,102,241,0.16));
          border: 1px solid rgba(59,130,246,0.25);
          color: #2563eb;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.03em;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .dark .pro-badge { background: linear-gradient(120deg, rgba(59,130,246,0.22), rgba(99,102,241,0.22)); color: #93c5fd; border-color: rgba(59,130,246,0.3); }
        .premium-badge {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          padding: 1px 5px 1px 3px;
          border-radius: 5px;
          background: linear-gradient(120deg, rgba(245,158,11,0.18), rgba(250,204,21,0.18));
          border: 1px solid rgba(245,158,11,0.32);
          color: #b45309;
          font-size: 9px;
          font-weight: 650;
          letter-spacing: 0.03em;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .dark .premium-badge { background: linear-gradient(120deg, rgba(245,158,11,0.24), rgba(250,204,21,0.18)); color: #facc15; border-color: rgba(250,204,21,0.34); }

        /* ---------- Premium model selector ---------- */
        .model-trigger {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px 4px 7px;
          border-radius: 9px;
          border: 1px solid transparent;
          background: hsl(var(--muted) / 0.45);
          font-family: 'DM Sans', system-ui, sans-serif;
          transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        .model-trigger:hover {
          background: hsl(var(--muted) / 0.75);
          border-color: hsl(var(--border) / 0.7);
        }
        .model-trigger[data-state="open"] {
          background: hsl(var(--background));
          border-color: rgba(59,130,246,0.35);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.07);
        }
        .model-status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 0 2px rgba(34,197,94,0.18);
          flex-shrink: 0;
        }
        .model-trigger-label {
          font-size: 11.5px;
          font-weight: 500;
          color: hsl(var(--foreground));
          max-width: 88px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .model-select-content {
          border-radius: 12px;
          overflow: hidden;
          background: hsl(var(--popover));
          box-shadow: 0 16px 36px -14px rgba(0,0,0,0.28), 0 3px 12px rgba(0,0,0,0.06);
          border: 1px solid hsl(var(--border) / 0.6);
          transform-origin: var(--radix-select-content-transform-origin);
          animation: selectContentIn 0.16s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform, opacity;
        }
        .model-select-content[data-state="closed"] {
          animation: selectContentOut 0.12s ease-in;
        }
        .model-select-header {
          padding: 8px 10px 7px;
          border-bottom: 1px solid hsl(var(--border) / 0.5);
          background: linear-gradient(180deg, rgba(59,130,246,0.05), transparent);
        }
        .model-select-header-title {
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 11.5px;
          font-weight: 600;
          color: hsl(var(--foreground));
        }
        .model-select-header-sub {
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 9.5px;
          color: hsl(var(--muted-foreground));
          margin-top: 0;
        }

        .model-item {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 6px 8px 6px 7px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          line-height: 1.2;
          transition: background 0.14s ease;
        }
        .model-item[data-highlighted] {
          background: linear-gradient(90deg, rgba(59,130,246,0.08), rgba(99,102,241,0.03));
          outline: none;
        }

        @keyframes selectContentIn {
          from { opacity: 0; transform: translateY(4px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes selectContentOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(4px) scale(0.98); }
        }
        .model-item[data-disabled] {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .model-item-tier-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .model-item-tier-dot.is-free {
          background: #22c55e;
          box-shadow: 0 0 0 2px rgba(34,197,94,0.14);
        }
        .model-item-tier-dot.is-pro {
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          box-shadow: 0 0 0 2px rgba(59,130,246,0.14);
        }
        .model-item-tier-dot.is-premium {
          background: linear-gradient(135deg, #f59e0b, #facc15);
          box-shadow: 0 0 0 2px rgba(245,158,11,0.18);
        }
        .model-credit-pill {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          padding: 1px 5px;
          border-radius: 99px;
          font-size: 9.5px;
          font-weight: 600;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          background: hsl(var(--muted) / 0.6);
        }

        /* ---------- Plan mode toggle ---------- */
        .plan-mode-toggle {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 7px 9px;
          border: 1px solid transparent;
          border-radius: 8px;
          background: hsl(var(--muted) / 0.5);
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 12.5px;
          font-weight: 500;
          letter-spacing: -0.01em;
          color: hsl(var(--muted-foreground));
          cursor: pointer;
          transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
          white-space: nowrap;
        }
        .plan-mode-toggle:hover {
          color: hsl(var(--foreground));
        }
        .plan-mode-toggle.is-active {
          color: rgb(59 130 246);
          border-color: rgb(59 130 246 / 0.22);
          background: rgb(59 130 246 / 0.08);
          box-shadow: 0 0 0 1px rgb(59 130 246 / 0.04);
        }

        @media (max-width: 639px) {
          .select-trigger-custom {
            min-height: 34px;
            padding: 6px 8px;
          }

          .upload-btn {
            width: 34px;
            height: 34px;
          }

          .build-btn {
            min-height: 42px;
            min-width: 104px;
          }

          .model-trigger-label { max-width: 76px; }
        }

        /* ---------- Built with Squid showcase ---------- */
        .showcase-panel {
          position: relative;
          border-radius: 28px;
          border: 1px solid hsl(var(--border) / 0.6);
          background:
            radial-gradient(ellipse 90% 70% at 82% 8%, rgba(59,130,246,0.10), transparent 62%),
            linear-gradient(180deg, hsl(var(--muted) / 0.35), hsl(var(--background)));
          overflow: hidden;
        }
        .showcase-panel::before {
          content: '';
          position: absolute;
          inset: -45%;
          background:
            radial-gradient(ellipse 44% 32% at 74% 28%, rgba(59,130,246,0.13), rgba(59,130,246,0.055) 34%, transparent 66%),
            radial-gradient(ellipse 38% 28% at 58% 18%, rgba(99,102,241,0.07), transparent 64%),
            radial-gradient(ellipse 46% 36% at 22% 42%, rgba(14,165,233,0.045), transparent 68%);
          animation: meshDrift 14s ease-in-out infinite;
          filter: blur(22px);
          opacity: 0.95;
          pointer-events: none;
        }
        .showcase-panel::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(hsl(var(--border) / 0.35) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--border) / 0.35) 1px, transparent 1px);
          background-size: 42px 42px;
          -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 75%);
          mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 75%);
          pointer-events: none;
          opacity: 0.9;
        }

        @media (max-width: 767px) {
          .showcase-panel {
            background:
              radial-gradient(ellipse 120% 58% at 50% 0%, rgba(59,130,246,0.09), transparent 68%),
              linear-gradient(180deg, hsl(var(--muted) / 0.34), hsl(var(--background)));
          }
          .showcase-panel::before {
            inset: -38%;
            background:
              radial-gradient(ellipse 60% 34% at 52% 16%, rgba(59,130,246,0.11), rgba(59,130,246,0.045) 38%, transparent 70%),
              radial-gradient(ellipse 54% 32% at 78% 36%, rgba(99,102,241,0.055), transparent 72%);
            filter: blur(26px);
          }
        }

        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px 4px 8px;
          border-radius: 99px;
          border: 1px solid hsl(var(--border) / 0.6);
          background: hsl(var(--background) / 0.8);
          backdrop-filter: blur(6px);
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.04em;
          color: hsl(var(--muted-foreground));
        }
        .live-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
          animation: livePulse 2s infinite;
        }

        .browser-window {
          position: relative;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid hsl(var(--border) / 0.7);
          background: hsl(var(--card));
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.35s ease;
        }
        .browser-window:hover {
          transform: translateY(-4px);
          border-color: rgba(59,130,246,0.4);
          box-shadow: 0 24px 48px -18px rgba(0,0,0,0.28), 0 0 0 1px rgba(59,130,246,0.12);
        }
        .browser-chrome {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          background: hsl(var(--muted) / 0.55);
          border-bottom: 1px solid hsl(var(--border) / 0.6);
        }
        .browser-dots {
          display: flex;
          gap: 5px;
          flex-shrink: 0;
        }
        .browser-dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: hsl(var(--muted-foreground) / 0.25);
        }
        .browser-url-bar {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 6px;
          background: hsl(var(--background) / 0.8);
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 10.5px;
          color: hsl(var(--muted-foreground));
          min-width: 0;
        }
        .browser-url-bar span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .browser-url-lock {
          width: 7px;
          height: 7px;
          border-radius: 2px;
          border: 1.2px solid hsl(var(--muted-foreground) / 0.5);
          flex-shrink: 0;
        }
      `}</style>
  );
}

export function HomepageMarketingContent() {
  return (
    <>
      <HomepageAnswerSection />
      <BuiltWithSquidSection />
      <HomepageFaqSection />
      <HoverBrandLogo />
      <LandingMacbookSection />
      <Footer showPageLinks />
    </>
  );
}

export function HomepageAnswerSection() {
  return (
    <section
      aria-labelledby="squid-agent-overview"
      className="relative z-10 w-full px-4 pb-16 pt-4 sm:px-6 sm:pb-24 sm:pt-6"
    >
      <div className="mx-auto w-full max-w-6xl border-y border-border/60 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono-jb text-[11px] font-medium uppercase tracking-[0.16em] text-blue-500">
            AI app builder
          </p>
          <h2
            id="squid-agent-overview"
            className="mt-4 font-display text-4xl leading-[0.98] tracking-normal text-foreground sm:text-5xl"
          >
            From prompt to owned React code.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            The homepage copy is arranged around the actual product path: give
            Squid Agent intent, inspect the result, understand the cost, and
            leave with code you can keep.
          </p>
        </div>

        <div className="relative mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-[minmax(0,1fr)_4rem_minmax(0,1fr)] md:gap-x-6 md:gap-y-10">
          <div className="pointer-events-none absolute left-1/2 top-3 hidden h-[calc(100%-1.5rem)] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-border to-transparent md:block" />
          {homepageNarrativeBlocks.map((block) => {
            const isLeft = block.side === "left";

            return (
              <div key={block.question} className="grid gap-4 md:contents">
                {isLeft ? (
                  <HomepageNarrativeArticle
                    block={block}
                    className="md:col-start-1"
                  />
                ) : (
                  <div className="hidden md:col-start-1 md:block" />
                )}

                <div className="relative hidden items-center justify-center md:col-start-2 md:flex">
                  <span className="relative z-10 flex size-5 items-center justify-center rounded-full border border-blue-500/30 bg-background shadow-[0_0_0_6px_hsl(var(--background)),0_0_28px_rgba(59,130,246,0.22)]">
                    <span className="size-1.5 rounded-full bg-blue-500" />
                  </span>
                </div>

                {isLeft ? (
                  <div className="hidden md:col-start-3 md:block" />
                ) : (
                  <HomepageNarrativeArticle
                    block={block}
                    className="md:col-start-3 md:translate-y-8"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HomepageNarrativeArticle({
  block,
  className = "",
}: {
  block: (typeof homepageNarrativeBlocks)[number];
  className?: string;
}) {
  return (
    <article
      className={`relative rounded-[24px] border border-border/70 bg-background/80 p-5 shadow-[0_18px_48px_-34px_rgba(0,0,0,0.55)] backdrop-blur sm:p-6 ${className}`}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono-jb text-[10px] font-medium uppercase tracking-[0.16em] text-blue-500">
          {block.label}
        </p>
        <span className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
      </div>
      <h3 className="mt-4 text-2xl font-semibold leading-tight tracking-normal text-foreground">
        {block.question}
      </h3>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {block.body}
      </p>
    </article>
  );
}

export function HomepageFaqSection() {
  return (
    <section
      aria-labelledby="squid-agent-faq"
      className="relative z-10 w-full px-4 pb-16 sm:px-6 sm:pb-24"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-8 border-t border-border/60 pt-12 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:pt-16">
        <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
          <p className="font-mono-jb text-[11px] font-medium uppercase tracking-[0.16em] text-blue-500">
            FAQ
          </p>
          <h2
            id="squid-agent-faq"
            className="mt-4 font-display text-4xl leading-[0.98] tracking-normal text-foreground sm:text-5xl"
          >
            Clear answers for people and crawlers.
          </h2>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            These answers make the product definition, audience, export model,
            and credit behavior explicit without burying them inside the hero or
            project showcase.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {homepageFaq.map((item) => (
            <article
              key={item.question}
              className="rounded-[22px] border border-border/70 bg-background/80 p-5 shadow-[0_16px_42px_-34px_rgba(0,0,0,0.55)] backdrop-blur"
            >
              <h3 className="text-lg font-semibold leading-snug tracking-normal text-foreground">
                {item.question}
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BuiltWithSquidSection() {
  const visibleProjects = [...BUILT_WITH_SQUID_PROJECTS];
  const featuredProject =
    visibleProjects.find((project) => project.featured) ?? visibleProjects[0];
  const galleryProjects = visibleProjects
    .filter((project) => project.href !== featuredProject?.href)
    .slice(0, 4);

  if (!featuredProject) return null;

  const getProjectGradient = (project: BuiltWithSquidProject, index: number) =>
    project.gradient ??
    [
      "linear-gradient(135deg, #111827 0%, #2563eb 55%, #f8fafc 100%)",
      "linear-gradient(135deg, #0f2f2e 0%, #0d9488 52%, #f0fdfa 100%)",
      "linear-gradient(135deg, #2f1731 0%, #db2777 55%, #fff7ed 100%)",
      "linear-gradient(135deg, #172554 0%, #4f46e5 52%, #ecfeff 100%)",
    ][index % 4];

  const featuredGradient = getProjectGradient(featuredProject, 0);
  const featuredPreview =
    featuredProject.preview ??
    featuredProject.name.split(/\s+/).slice(0, 4).join(" ");

  return (
    <section
      id="built-with-squid"
      className="relative z-10 w-full px-4 pb-14 pt-4 sm:px-6 sm:pb-20 sm:pt-8"
    >
      <div className="showcase-panel mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-10 sm:px-9 sm:py-14">
        <div className="relative grid gap-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-end">
          <div>
            <div className="live-badge">
              <span className="live-badge-dot" />
              BUILT WITH SQUID
            </div>
            <h2 className="mt-4 max-w-2xl font-display text-4xl leading-[0.98] tracking-tight text-foreground sm:text-5xl">
              Real projects shipped from prompts.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            A showcase of sites and tools built with Squid. Each window links to
            a public preview users can remix, copy, or download.
          </p>
        </div>

        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
          <a
            href={featuredProject.href}
            target="_blank"
            rel="noreferrer"
            className="browser-window group flex flex-col"
          >
            <div className="browser-chrome">
              <div className="browser-dots">
                <span />
                <span />
                <span />
              </div>
              <div className="browser-url-bar">
                <span className="browser-url-lock" />
                <span>{getDisplayPreviewUrl(featuredProject.href)}</span>
              </div>
              <ExternalLink className="size-3.5 flex-shrink-0 text-muted-foreground/60 transition-colors group-hover:text-blue-500" />
            </div>
            <div
              className="relative flex aspect-[16/9] w-full items-end overflow-hidden p-6"
              style={
                featuredProject.imageSrc
                  ? undefined
                  : { background: featuredGradient }
              }
            >
              {featuredProject.imageSrc ? (
                <Image
                  src={featuredProject.imageSrc}
                  alt={
                    featuredProject.imageAlt ??
                    `${featuredProject.name} project preview built with Squid`
                  }
                  fill
                  sizes="(min-width: 1024px) 62rem, 100vw"
                  className="object-cover object-top"
                />
              ) : (
                <>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(255,255,255,0.46),transparent_26%),linear-gradient(180deg,transparent,rgba(0,0,0,0.28))]" />
                  <p className="relative max-w-md text-4xl font-semibold leading-none tracking-normal text-white sm:text-5xl">
                    {featuredPreview}
                  </p>
                </>
              )}
            </div>
            <div className="flex flex-col gap-5 border-t border-border/70 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
              <div className="min-w-0">
                <p className="font-mono-jb text-[10.5px] uppercase tracking-[0.14em] text-blue-500/80">
                  {featuredProject.category}
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                  {featuredProject.name}
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {featuredProject.description}
                </p>
                {featuredProject.creatorName && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Shared by {featuredProject.creatorName}
                  </p>
                )}
              </div>
              <span className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-blue-500">
                View project
                <ExternalLink className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </div>
          </a>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            {galleryProjects.map((project, index) => (
              <a
                key={project.href}
                href={project.href}
                target="_blank"
                rel="noreferrer"
                className="browser-window group flex min-h-[240px] flex-col"
              >
                <div className="browser-chrome">
                  <div className="browser-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="browser-url-bar">
                    <span className="browser-url-lock" />
                    <span>{getDisplayPreviewUrl(project.href)}</span>
                  </div>
                </div>
                <div
                  className={
                    project.imageSrc
                      ? "relative aspect-[1908/959] w-full flex-none overflow-hidden bg-white"
                      : "relative flex min-h-28 flex-1 items-end overflow-hidden p-4"
                  }
                  style={{
                    background: project.imageSrc
                      ? undefined
                      : getProjectGradient(project, index + 1),
                  }}
                >
                  {project.imageSrc ? (
                    <Image
                      src={project.imageSrc}
                      alt={
                        project.imageAlt ??
                        `${project.name} project preview built with Squid`
                      }
                      fill
                      sizes="(min-width: 1024px) 20rem, 50vw"
                      className="object-contain object-center"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(255,255,255,0.42),transparent_28%),linear-gradient(180deg,transparent,rgba(0,0,0,0.25))]" />
                      <p className="relative max-w-[12rem] text-xl font-semibold leading-none tracking-tight text-white">
                        {project.preview ?? project.name}
                      </p>
                    </>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono-jb text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {project.category}
                    </p>
                    <ExternalLink className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-blue-500" />
                  </div>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                    {project.name}
                  </h3>
                  <p className="mt-2 text-sm leading-5 text-muted-foreground">
                    {project.description}
                  </p>
                  {project.creatorName && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Shared by {project.creatorName}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingMacbookSection() {
  return (
    <section
      aria-label="Animated MacBook Air"
      className="relative z-10 w-full overflow-hidden px-4 pb-10 pt-2 sm:px-6 sm:pb-14"
    >
      <div className="mx-auto flex h-[230px] w-full max-w-6xl items-center justify-center border-t border-border/60 sm:h-[270px]">
        <div className="relative h-[220px] w-full max-w-md">
          <Macbook className="scale-125 sm:scale-150" />
        </div>
      </div>
    </section>
  );
}

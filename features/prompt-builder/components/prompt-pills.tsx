"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Globe,
  LogIn,
  ShoppingCart,
  Briefcase,
  Settings,
  MessageCircle,
  Table2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PromptPillsProps {
  onSelect: (prompt: string) => void;
}

// ---------------------------------------------------------------------------
// Preset prompts
// ---------------------------------------------------------------------------

interface Pill {
  id: string;
  label: string;
  icon: React.ElementType;
  prompt: string;
}

const PILL_DATA: Pill[] = [
  {
    id: "landing",
    label: "SaaS Landing Page",
    icon: Globe,
    prompt:
      "Build a B2B SaaS landing for technical buyers with a Linear-calm / modern-minimal language. Design Read first, then lock dials around variance 6, motion 4, density 3. Open with an asymmetric split hero (product preview on one side, thesis + one primary CTA on the other) that fits the first viewport: headline max 2 lines, subtext max 20 words, no trust logos or stats in the hero. Below: a logo wall, then a gapless 5-cell bento of real product capabilities (not three equal icon cards), a quote-led proof section using only invented-but-believable operator names (no Acme/Jane Doe), and a pricing comparison with two honest tiers plus a contact path. One accent family, hairline borders, compact radii, no purple gradients, no gradient headlines, no em-dashes, eyebrows on at most one section. One orchestrated entrance + scroll reveals; respect reduced motion.",
  },
  {
    id: "dashboard",
    label: "Dashboard UI",
    icon: LayoutDashboard,
    prompt:
      "Create an analytics workbench (not a marketing page) with dials around variance 5, motion 3, density 7. Use a left rail + top filter bar + main canvas. Lead with one grouped summary band of key metrics using borders and tabular numbers rather than four identical elevated cards. Include a primary line chart and a secondary breakdown table or bar chart with fully styled axes, legends, and tooltips for a light-first neutral shell. Add a compact activity stream. Filters: date range and metric selector with real local state. Light content area, restrained accent for selected nav/focus only. Skeleton loading, empty, and error states. Mobile collapses the rail into a sheet; keep primary filters reachable.",
  },
  {
    id: "auth",
    label: "Login & Signup",
    icon: LogIn,
    prompt:
      "Design a login and signup experience as a focused single-task flow with a split composition: left side is a subject-specific brand panel (no generic purple mesh), right side is the form. Toggle Login and Signup with shared layout. Login: email, password, remember me, forgot password, and social buttons for Google and GitHub. Signup: name, email, password, confirm password, terms. Inline validation, loading submit, success handoff, and accessible focus states. Minimalist register: hairline borders, compact radii, one accent, no glass cards. Mobile stacks vertically with the form first.",
  },
  {
    id: "product",
    label: "E-commerce Product",
    icon: ShoppingCart,
    prompt:
      "Build a product detail page for a specialty goods store with a premium Cold Luxury palette (silver/smoke neutrals + one sharp accent — not cream+brass). Asymmetric gallery + buy panel: large image stage with thumbnails, title, rating, price with compare-at, short description, color/size selectors, quantity stepper, and Add to Cart with tactile press feedback. Below: grouped specs in a 2-column card grid (not a long border-every-row table), then reviews. Sticky mobile purchase bar. One signature motion on the cart action only; keep the rest quiet.",
  },
  {
    id: "portfolio",
    label: "Portfolio Site",
    icon: Briefcase,
    prompt:
      "Create a designer portfolio with an editorial / kinetic language (variance 8, motion 7, density 3). Type-led hero that fits the first viewport: name as brand signal, one-line positioning, one primary CTA to work — no scroll cue, no neon, no geometric typing gimmick. Selected work as a horizontal scroll or sticky-stack of large case studies (gapless, N projects → N cells). About as a quiet text+portrait stack. Contact as a single clear form. Sans display + refined body; one accent; dark or light theme lock for the whole page. Motivated scroll reveals only; honor reduced motion.",
  },
  {
    id: "settings",
    label: "Settings Panel",
    icon: Settings,
    prompt:
      "Build a settings workbench with vertical section nav (Profile, Notifications, Security, Billing, Integrations). Profile: avatar upload, name/email, bio, save. Notifications: grouped toggles. Security: password change, 2FA toggle, sessions list with revoke. Prefer divide-y sections and hairline borders over nested cards. Unsaved-changes detection, inline validation, and a save toast. Modern-minimal / Cobalt-adjacent: one signal accent, compact radii, high legibility. Keyboard-friendly tabs and 44px targets.",
  },
  {
    id: "chat",
    label: "Chat Interface",
    icon: MessageCircle,
    prompt:
      "Design a messaging workbench: thread list (avatar, name, preview, timestamp, unread count) + conversation canvas + composer. Sent/received bubbles with clear contrast pairs, grouped timestamps, read receipts, typing indicator as a real semantic state (not decorative dots on every row). Composer: attach, text area that grows, send. Online presence only where it means something. Light-first neutral shell with one accent for sent bubbles/focus. Mobile hides the thread list behind a back affordance. Empty inbox and failed-send states included.",
  },
  {
    id: "table",
    label: "Data Table",
    icon: Table2,
    prompt:
      "Create a dense data table workbench (density 8) with toolbar search, status/category/date filters, export, and bulk delete behind AlertDialog. Sortable headers, multi-select, rows with avatar, name, status badge, date, and a row action menu. Pagination with page size. Column visibility menu. Loading skeleton matching the table shape, and a composed empty state that explains how to populate. Prefer borders and zebra/hover rows over heavy cards. Utilitarian modern-minimal tone; mono/tabular numbers; no marketing hero.",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PromptPills({ onSelect }: PromptPillsProps) {
  return (
    <div className="relative -mx-1">
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent sm:w-12" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent sm:w-12" />

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-1 py-1">
        {PILL_DATA.map((pill) => {
          const Icon = pill.icon;
          return (
            <button
              key={pill.id}
              onClick={() => onSelect(pill.prompt)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full border border-border/60 bg-background px-4 py-2 text-sm font-medium text-muted-foreground",
                "transition-all duration-200 hover:border-border hover:bg-accent/50 hover:text-foreground hover:shadow-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "active:scale-[0.97]",
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {pill.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

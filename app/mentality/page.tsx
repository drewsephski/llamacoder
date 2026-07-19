import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";

import Hero from "@/components/mentality/hero";
import Navbar from "@/components/mentality/navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-mentality-sans",
  display: "swap",
  weight: ["400", "500", "600"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-mentality-display",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "mėntality — Mental wellbeing resources",
  description:
    "Information and resources to help you manage your mental wellbeing.",
};

export default function MentalityPage() {
  return (
    <div
      className={`${inter.variable} ${outfit.variable} mentality-page min-h-screen bg-bg-base selection:bg-brand-green selection:text-black`}
    >
      <Navbar />
      <main>
        <Hero />
      </main>
    </div>
  );
}

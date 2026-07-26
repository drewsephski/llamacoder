import { Inter, Outfit } from "next/font/google";

import Hero from "@/components/mentality/hero";
import Navbar from "@/components/mentality/navbar";
import { publicShowcaseMetadata } from "@/lib/public-pages";

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

export const metadata = publicShowcaseMetadata("/mentality");

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

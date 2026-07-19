import type { Metadata } from "next";

import Hero from "@/components/rivr/hero";

export const metadata: Metadata = {
  title: "RIVR — Fluid Asset Streams",
  description:
    "Access Smart Vaults, stake RIVR, NFTs, and transform rigid holdings into liquid cash instantly.",
};

export default function RIVRPage() {
  return (
    <main className="rivr-page min-h-screen bg-[#f0f0f0]">
      <Hero />
    </main>
  );
}

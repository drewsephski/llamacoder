import Hero from "@/components/rivr/hero";
import { publicShowcaseMetadata } from "@/lib/public-pages";

export const metadata = publicShowcaseMetadata("/rivr");

export default function RIVRPage() {
  return (
    <main className="rivr-page min-h-screen bg-[#f0f0f0]">
      <Hero />
    </main>
  );
}

import { Inter } from "next/font/google";

import { SkyElitePage } from "@/components/skyelite-page";
import { publicShowcaseMetadata } from "@/lib/public-pages";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = publicShowcaseMetadata("/skyelite");

export default function SkyEliteRoute() {
  return <SkyElitePage fontClassName={inter.className} />;
}

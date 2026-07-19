import type { Metadata } from "next";
import { Kanit } from "next/font/google";

import JackPortfolioPage from "@/components/jack/jack-portfolio-page";

const kanit = Kanit({
  subsets: ["latin"],
  variable: "--font-jack-kanit",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Drew -- AI Engineer & Product Builder",
  description:
    "Drew builds AI products, software, web experiences, and motion-led product stories.",
};

export default function JackPage() {
  return <JackPortfolioPage fontClassName={kanit.variable} />;
}

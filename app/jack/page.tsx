import { Kanit } from "next/font/google";

import JackPortfolioPage from "@/components/jack/jack-portfolio-page";
import { publicShowcaseMetadata } from "@/lib/public-pages";

const kanit = Kanit({
  subsets: ["latin"],
  variable: "--font-jack-kanit",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = publicShowcaseMetadata("/jack");

export default function JackPage() {
  return <JackPortfolioPage fontClassName={kanit.variable} />;
}

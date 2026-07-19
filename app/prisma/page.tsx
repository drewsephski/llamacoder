import type { Metadata } from "next";
import { Almarai, Instrument_Serif } from "next/font/google";

import PrismaPage from "@/components/prisma-page";

const almarai = Almarai({
  subsets: ["latin"],
  variable: "--font-prisma-almarai",
  display: "swap",
  weight: ["300", "400", "700", "800"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-prisma-serif",
  display: "swap",
  style: "italic",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Prisma — Visual arts for visionary creators",
  description:
    "Prisma is a worldwide network of visual artists, filmmakers, and storytellers.",
};

export default function PrismaRoute() {
  return (
    <PrismaPage
      fontClassName={`${almarai.variable} ${instrumentSerif.variable}`}
    />
  );
}

import type { Metadata } from "next";

import FormaPage from "@/components/forma-page";

export const metadata: Metadata = {
  title: "Forma — Bold ideas, shipped as products",
  description:
    "Forma crafts bold digital ideas and ships them as thoughtful products.",
};

export default function FormaRoute() {
  return <FormaPage />;
}

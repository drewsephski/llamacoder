import type { Metadata } from "next";

import AxionStudioPage from "./page.client";

export const metadata: Metadata = {
  title: "Axion Studio — Digital experiences for category leaders",
  description:
    "Axion Studio crafts strategy-led digital experiences for brands ready to dominate their category online.",
};

export default function Page() {
  return <AxionStudioPage />;
}

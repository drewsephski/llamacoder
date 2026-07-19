import type { Metadata } from "next";

import MindloopPage from "@/components/mindloop-page";

export const metadata: Metadata = {
  title: "Mindloop — Meaningful content, made to last",
  description:
    "A calmer home for curious readers, thoughtful writers, and meaningful conversations.",
};

export default function Page() {
  return <MindloopPage />;
}

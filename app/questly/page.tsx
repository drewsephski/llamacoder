import type { Metadata } from "next";

import { QuestlyPage } from "@/components/questly-page";

export const metadata: Metadata = {
  title: "Questly — Get cited. Effortlessly.",
  description:
    "Ship articles that answer actual customer questions and get seen in AI search.",
};

export default function QuestlyRoute() {
  return <QuestlyPage />;
}

import { QuestlyPage } from "@/components/questly-page";
import { publicShowcaseMetadata } from "@/lib/public-pages";

export const metadata = publicShowcaseMetadata("/questly");

export default function QuestlyRoute() {
  return <QuestlyPage />;
}

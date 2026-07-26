import FormaPage from "@/components/forma-page";
import { publicShowcaseMetadata } from "@/lib/public-pages";

export const metadata = publicShowcaseMetadata("/forma");

export default function FormaRoute() {
  return <FormaPage />;
}

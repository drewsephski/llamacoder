import MindloopPage from "@/components/mindloop-page";
import { publicShowcaseMetadata } from "@/lib/public-pages";

export const metadata = publicShowcaseMetadata("/mindloop");

export default function Page() {
  return <MindloopPage />;
}

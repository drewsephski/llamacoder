import AxionStudioPage from "./page.client";
import { publicShowcaseMetadata } from "@/lib/public-pages";

export const metadata = publicShowcaseMetadata("/axion-studio");

export default function Page() {
  return <AxionStudioPage />;
}

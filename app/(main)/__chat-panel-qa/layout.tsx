import { createNoIndexMetadata } from "@/lib/seo";

export const metadata = createNoIndexMetadata({
  title: "Chat Panel QA Fixture",
  description: "Internal visual QA fixture for the Squid Agent chat panel.",
  path: "/__chat-panel-qa",
});

export default function ChatPanelQaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import { DashboardPage } from "@/features/projects/components/dashboard-page";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata = createNoIndexMetadata({
  title: "Dashboard",
  description: "Manage Squid Agent projects, credits, and account activity.",
  path: "/dashboard",
});

export default DashboardPage;

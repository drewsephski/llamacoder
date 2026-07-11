import type { Metadata } from "next";

import { DashboardPage } from "@/features/projects/components/dashboard-page";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage Squid Agent projects, credits, and account activity.",
  robots: { index: false, follow: false },
};

export default DashboardPage;

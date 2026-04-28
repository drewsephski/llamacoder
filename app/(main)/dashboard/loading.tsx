import Spinner from "@/components/spinner";

export default function DashboardLoading() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <Spinner className="block size-8" />
      <p className="text-sm text-muted-foreground">Loading dashboard...</p>
    </div>
  );
}

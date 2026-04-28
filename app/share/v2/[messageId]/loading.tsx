import Spinner from "@/components/spinner";

export default function LoadingPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4">
      <Spinner className="block size-12" />
      <p>Loading your app...</p>
    </div>
  );
}

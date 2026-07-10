import Providers from "@/app/(main)/providers";
import { Toaster } from "sonner";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <div className="flex min-h-full flex-1 flex-col bg-background text-foreground antialiased">
        {children}

        <Toaster />
      </div>
    </Providers>
  );
}

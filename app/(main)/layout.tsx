import Providers from "@/app/(main)/providers";
import { Toaster } from "sonner";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <body className="flex min-h-full flex-col bg-background text-foreground antialiased">
        {children}

        <Toaster />
      </body>
    </Providers>
  );
}

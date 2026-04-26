"use client";

import { createContext, ReactNode, useState } from "react";
import { ThemeProvider } from "next-themes";

export const Context = createContext<{
  streamPromise?: Promise<ReadableStream>;
  setStreamPromise: (v: Promise<ReadableStream> | undefined) => void;
}>({
  setStreamPromise: () => {},
});

export default function Providers({ children }: { children: ReactNode }) {
  const [streamPromise, setStreamPromise] = useState<Promise<ReadableStream>>();

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Context value={{ streamPromise, setStreamPromise }}>{children}</Context>
    </ThemeProvider>
  );
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";
import CodeRunner from "@/components/code-runner";
import { getPrisma } from "@/lib/prisma";
import { createNoIndexMetadata } from "@/lib/seo";

/*
  This is the Share page for v1 apps, before the chat interface was added.

  It's here to preserve existing URLs.
*/
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const generatedApp = await getGeneratedAppByID((await params).id);

  let prompt = generatedApp?.prompt;
  if (typeof prompt !== "string") {
    notFound();
  }

  const searchParams = new URLSearchParams();
  searchParams.set("prompt", prompt);
  const concisePrompt = prompt.replaceAll(/\s+/g, " ").trim();
  const title = concisePrompt.slice(0, 64) || "Generated React app";

  return createNoIndexMetadata({
    title: `${title}${concisePrompt.length > 64 ? "…" : ""}`,
    description: `A legacy React app preview generated with Squid Agent from this prompt: ${concisePrompt.slice(0, 120)}`,
    path: `/share/${encodeURIComponent((await params).id)}`,
    image: {
      url: `/api/og?${searchParams}`,
      width: 1200,
      height: 630,
      alt: "Generated React app preview",
    },
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // if process.env.DATABASE_URL is not set, throw an error
  if (typeof id !== "string") {
    notFound();
  }

  const generatedApp = await getGeneratedAppByID(id);

  if (!generatedApp) {
    return <div>App not found</div>;
  }

  return (
    <main
      aria-label="Generated app preview"
      className="h-dvh min-h-[520px] w-full min-w-0 overflow-hidden"
    >
      <CodeRunner language="tsx" code={generatedApp.code} showStatusOverlay />
    </main>
  );
}

const getGeneratedAppByID = cache(async (id: string) => {
  const prisma = getPrisma();
  return prisma.generatedApp.findUnique({
    where: {
      id,
    },
  });
});

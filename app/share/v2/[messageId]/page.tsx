import CodeRunner from "@/components/code-runner";
import { getPrisma } from "@/lib/prisma";
import { extractAllCodeBlocks } from "@/lib/utils";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ messageId: string }>;
}): Promise<Metadata> {
  let { messageId } = await params;
  const message = await getMessage(messageId);
  if (!message) {
    notFound();
  }

  let title = message.chat.title;
  let searchParams = new URLSearchParams();
  searchParams.set("prompt", title);

  return {
    title,
    description: `An app generated on SquidCoder.io: ${title}`,
    openGraph: {
      images: [`/api/og?${searchParams}`],
    },
    twitter: {
      card: "summary_large_image",
      images: [`/api/og?${searchParams}`],
      title,
    },
  };
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ messageId: string }>;
}) {
  const { messageId } = await params;

  const prisma = getPrisma();
  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) {
    notFound();
  }

  const files = extractAllCodeBlocks(message.content);
  if (files.length === 0) {
    notFound();
  }

  return (
    <div className="flex h-full w-full grow flex-col">
      <div className="flex h-full grow items-center justify-center">
        <CodeRunner
          files={files.map((f) => ({ path: f.path, content: f.code }))}
        />
      </div>

      {/* Floating desktop banner */}
      <div className="fixed bottom-4 right-4 z-50 hidden md:block">
        <a
          className="inline-flex shrink-0 items-center rounded-full border border-border bg-background px-3.5 py-1.5 text-xs text-foreground shadow-lg transition-shadow hover:shadow-sm"
          href={`https://squidcoder.io/?ref=${messageId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="text-center">
            Powered by <span className="font-semibold">SquidCoder</span>
          </span>
        </a>
      </div>
    </div>
  );
}

const getMessage = cache(async (messageId: string) => {
  const prisma = getPrisma();
  return prisma.message.findUnique({
    where: {
      id: messageId,
    },
    include: {
      chat: true,
    },
  });
});

import { createUserMessageRequestSchema } from "@/features/generation/contracts";
import { createMessage } from "@/features/generation/server/actions";
import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const parsed = createUserMessageRequestSchema.safeParse(
    await request.json().catch(() => null),
  );

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "INVALID_REQUEST",
        message: parsed.error.issues[0]?.message ?? "Invalid message",
      },
      { status: 400 },
    );
  }

  const { projectId } = await context.params;

  try {
    const message = await createMessage(projectId, parsed.data.text, "user");
    return NextResponse.json({ messageId: message.id });
  } catch (error) {
    unstable_rethrow(error);

    const message = error instanceof Error ? error.message : "";
    if (message === "You must be signed in to send messages") {
      return NextResponse.json(
        {
          error: "AUTHENTICATION_REQUIRED",
          message: "Please sign in to send messages",
        },
        { status: 401 },
      );
    }

    if (message === "You do not have access to this project") {
      return NextResponse.json(
        { error: "PROJECT_NOT_FOUND", message: "Project not found" },
        { status: 404 },
      );
    }

    if (message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json(
        {
          error: "INSUFFICIENT_CREDITS",
          message: "You need more credits to edit this project.",
        },
        { status: 402 },
      );
    }

    if (message === "CREDIT_CHECK_FAILED") {
      return NextResponse.json(
        {
          error: "CREDIT_CHECK_FAILED",
          message: "Unable to verify your credit balance. Please try again.",
        },
        { status: 503 },
      );
    }

    console.error("Failed to create project message", {
      projectId,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "MESSAGE_CREATE_FAILED", message: "Failed to send message" },
      { status: 500 },
    );
  }
}

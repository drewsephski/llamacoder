import { NextRequest, NextResponse } from "next/server";

import { scrapeScreenshotRequestSchema } from "@/features/generation/contracts";
import {
  capturePublicUrlScreenshot,
  getScreenshotOneConfig,
  ScreenshotOneError,
} from "@/features/generation/server/screenshotone-screenshot";
import { getCurrentSession } from "@/features/auth/server/session";
import { consumeRateLimit } from "@/features/security/server/rate-limit";
import { parsePublicHttpUrl } from "@/features/security/server/public-url";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await consumeRateLimit({
      userId: session.user.id,
      operation: "screenshot",
      limit: 6,
      windowMs: 10 * 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many screenshot requests. Please try again shortly." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        },
      );
    }

    const parsedRequest = scrapeScreenshotRequestSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsedRequest.success) {
      return NextResponse.json(
        { error: "A valid URL is required" },
        { status: 400 },
      );
    }
    const { url } = parsedRequest.data;

    let validatedUrl: URL;
    try {
      validatedUrl = await parsePublicHttpUrl(url);
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid URL format. Please provide a valid http:// or https:// URL",
        },
        { status: 400 },
      );
    }

    if (!getScreenshotOneConfig()) {
      return NextResponse.json(
        {
          error: "SCREENSHOTONE_NOT_CONFIGURED",
          message:
            "Add SCREENSHOTONE_ACCESS_KEY to your environment. Get it from https://screenshotone.com/",
        },
        { status: 500 },
      );
    }

    const screenshotBuffer = await capturePublicUrlScreenshot(
      validatedUrl.toString(),
      { signal: request.signal },
    );
    const base64Screenshot = screenshotBuffer.toString("base64");
    const dataUrl = `data:image/png;base64,${base64Screenshot}`;

    return NextResponse.json({
      success: true,
      screenshotData: dataUrl,
      url: validatedUrl.toString(),
    });
  } catch (error: unknown) {
    console.error("Screenshot scraping error:", error);

    if (error instanceof ScreenshotOneError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    const message = error instanceof Error ? error.message : "";
    return NextResponse.json(
      { error: message || "Failed to capture screenshot" },
      { status: 500 },
    );
  }
}

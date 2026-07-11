import { NextRequest, NextResponse } from "next/server";
import { Stagehand } from "@browserbasehq/stagehand";
import { getCurrentSession } from "@/features/auth/server/session";
import { scrapeScreenshotRequestSchema } from "@/features/generation/contracts";
import { consumeRateLimit } from "@/features/security/server/rate-limit";
import { parsePublicHttpUrl } from "@/features/security/server/public-url";

export async function POST(request: NextRequest) {
  let stagehand: Stagehand | undefined;

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

    // Check for API key
    const apiKey = process.env.BROWSERBASE_API_KEY;
    const projectId = process.env.BROWSERBASE_PROJECT_ID;

    if (!apiKey || apiKey === "your_browserbase_api_key_here") {
      return NextResponse.json(
        {
          error: "BROWSERBASE_API_KEY not configured",
          message:
            "Please add your Browserbase API key to the .env file. Get it from https://browserbase.com/settings",
        },
        { status: 500 },
      );
    }

    if (!projectId || projectId === "your_browserbase_project_id_here") {
      return NextResponse.json(
        {
          error: "BROWSERBASE_PROJECT_ID not configured",
          message:
            "Please add your Browserbase Project ID to the .env file. Get it from https://browserbase.com/settings",
        },
        { status: 500 },
      );
    }

    // Initialize Stagehand
    stagehand = new Stagehand({
      apiKey,
      projectId,
      env: "BROWSERBASE",
      disablePino: true, // Disable pino to avoid transport issues in Next.js API route
    });

    await stagehand.init();

    const page =
      stagehand.context.pages()[0] || (await stagehand.context.newPage());

    // Navigate to the URL
    await page.goto(validatedUrl.toString(), {
      waitUntil: "domcontentloaded",
      timeoutMs: 30000,
    });
    await page.waitForLoadState("networkidle", 5000).catch(() => undefined);

    // Take screenshot
    const screenshotBuffer = await page.screenshot({
      type: "png",
      fullPage: false, // Capture viewport only for consistent sizing
    });

    // Convert to base64
    const base64Screenshot = Buffer.from(screenshotBuffer).toString("base64");
    const dataUrl = `data:image/png;base64,${base64Screenshot}`;

    return NextResponse.json({
      success: true,
      screenshotData: dataUrl,
      url: validatedUrl.toString(),
    });
  } catch (error: unknown) {
    console.error("Screenshot scraping error:", error);
    const message = error instanceof Error ? error.message : "";

    // Handle specific error cases
    if (message.includes("net::ERR_NAME_NOT_RESOLVED")) {
      return NextResponse.json(
        {
          error:
            "Could not resolve the website. Please check the URL and try again.",
        },
        { status: 400 },
      );
    }

    if (message.includes("net::ERR_CONNECTION_TIMED_OUT")) {
      return NextResponse.json(
        {
          error:
            "Connection timed out. The website may be blocking automated access.",
        },
        { status: 400 },
      );
    }

    if (message.includes("Navigation timeout")) {
      return NextResponse.json(
        {
          error:
            "The website took too long to load. Please try again or try a different URL.",
        },
        { status: 408 },
      );
    }

    return NextResponse.json(
      { error: message || "Failed to capture screenshot" },
      { status: 500 },
    );
  } finally {
    if (stagehand) {
      await Promise.resolve(stagehand.close()).catch((closeError: unknown) => {
        console.warn("Failed to close screenshot browser session:", closeError);
      });
    }
  }
}

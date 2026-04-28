import { NextRequest, NextResponse } from "next/server";
import { Stagehand } from "@browserbasehq/stagehand";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Validate URL format
    let validatedUrl: URL;
    try {
      validatedUrl = new URL(url);
      if (!["http:", "https:"].includes(validatedUrl.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format. Please provide a valid http:// or https:// URL" },
        { status: 400 }
      );
    }

    // Check for API key
    const apiKey = process.env.BROWSERBASE_API_KEY;
    const projectId = process.env.BROWSERBASE_PROJECT_ID;

    if (!apiKey || apiKey === "your_browserbase_api_key_here") {
      return NextResponse.json(
        { 
          error: "BROWSERBASE_API_KEY not configured",
          message: "Please add your Browserbase API key to the .env file. Get it from https://browserbase.com/settings"
        },
        { status: 500 }
      );
    }

    if (!projectId || projectId === "your_browserbase_project_id_here") {
      return NextResponse.json(
        { 
          error: "BROWSERBASE_PROJECT_ID not configured",
          message: "Please add your Browserbase Project ID to the .env file. Get it from https://browserbase.com/settings"
        },
        { status: 500 }
      );
    }

    // Initialize Stagehand
    const stagehand = new Stagehand({
      apiKey,
      projectId,
      env: "BROWSERBASE",
    });

    await stagehand.init();

    const page = stagehand.context.pages()[0] || await stagehand.context.newPage();

    // Navigate to the URL
    await page.goto(validatedUrl.toString(), {
      waitUntil: "networkidle",
      timeoutMs: 30000,
    });

    // Wait a bit for any lazy-loaded content
    await page.waitForTimeout(3000);

    // Take screenshot
    const screenshotBuffer = await page.screenshot({
      type: "png",
      fullPage: false, // Capture viewport only for consistent sizing
    });

    // Convert to base64
    const base64Screenshot = Buffer.from(screenshotBuffer).toString("base64");
    const dataUrl = `data:image/png;base64,${base64Screenshot}`;

    // Close the browser
    await stagehand.close();

    return NextResponse.json({
      success: true,
      screenshotData: dataUrl,
      url: validatedUrl.toString(),
    });

  } catch (error: any) {
    console.error("Screenshot scraping error:", error);
    
    // Handle specific error cases
    if (error.message?.includes("net::ERR_NAME_NOT_RESOLVED")) {
      return NextResponse.json(
        { error: "Could not resolve the website. Please check the URL and try again." },
        { status: 400 }
      );
    }
    
    if (error.message?.includes("net::ERR_CONNECTION_TIMED_OUT")) {
      return NextResponse.json(
        { error: "Connection timed out. The website may be blocking automated access." },
        { status: 400 }
      );
    }

    if (error.message?.includes("Navigation timeout")) {
      return NextResponse.json(
        { error: "The website took too long to load. Please try again or try a different URL." },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to capture screenshot" },
      { status: 500 }
    );
  }
}

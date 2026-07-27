import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST() {
  return NextResponse.json(
    {
      error: "DEPRECATED",
      message:
        "Gallery thumbnails are captured in the browser when you publish. Open Publish and retry the preview image instead.",
    },
    { status: 410 },
  );
}

export async function GET() {
  return NextResponse.json(
    {
      error: "METHOD_NOT_ALLOWED",
      message: "Use POST from the publish dialog to upload gallery previews.",
    },
    { status: 405 },
  );
}

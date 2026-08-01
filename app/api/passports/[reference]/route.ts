import { NextResponse } from "next/server";

import { resolvePublicArtifact } from "@/features/public-artifacts/server/access";
import { getBuildPassportForMessage } from "@/features/verification/server/build-passport";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params;
  const artifact = await resolvePublicArtifact(reference);
  if (!artifact) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Build passport not found" },
      { status: 404 },
    );
  }

  const passport = await getBuildPassportForMessage(artifact.message);
  const filename = `${slugify(passport.project.title)}-squid-build-passport.json`;

  return new NextResponse(JSON.stringify(passport, null, 2), {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "prototype"
  );
}

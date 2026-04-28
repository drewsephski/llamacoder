import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const handler = async (req: NextRequest) => {
  const path = req.nextUrl.pathname.replace("/api/auth", "");
  const url = new URL(req.url);
  url.pathname = path;

  const response = await auth.handler(new Request(url.toString(), {
    method: req.method,
    headers: req.headers,
    body: req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined,
  }));

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
};

export const GET = handler;
export const POST = handler;

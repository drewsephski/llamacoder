import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(req: NextRequest) {
  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0];
  const requestHost = (forwardedHost ?? req.headers.get("host") ?? "")
    .trim()
    .toLowerCase();

  if (requestHost === "squidagent.app") {
    const canonicalUrl = req.nextUrl.clone();
    canonicalUrl.protocol = "https:";
    canonicalUrl.hostname = "www.squidagent.app";
    canonicalUrl.port = "";
    return NextResponse.redirect(canonicalUrl, 308);
  }

  const isDashboardPage = req.nextUrl.pathname.startsWith("/dashboard");
  const isChatPage = req.nextUrl.pathname.startsWith("/chats");

  // Cookie presence is only a fast negative check. Protected pages validate
  // the session server-side so an expired cookie cannot grant route access.
  const sessionCookie = getSessionCookie(req);
  const hasSessionCookie = !!sessionCookie;

  // Redirect unauthenticated users trying to access protected routes
  if ((isDashboardPage || isChatPage) && !hasSessionCookie) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

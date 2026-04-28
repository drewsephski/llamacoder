import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(req: NextRequest) {
  const isAuthPage =
    req.nextUrl.pathname.startsWith("/sign-in") ||
    req.nextUrl.pathname.startsWith("/sign-up") ||
    req.nextUrl.pathname.startsWith("/forgot-password") ||
    req.nextUrl.pathname.startsWith("/reset-password");
  const isDashboardPage = req.nextUrl.pathname.startsWith("/dashboard");
  const isChatPage = req.nextUrl.pathname.startsWith("/chats");

  // Check for better-auth session cookie using the proper function
  const sessionCookie = getSessionCookie(req);
  const isAuthenticated = !!sessionCookie;

  // Redirect unauthenticated users trying to access protected routes
  if ((isDashboardPage || isChatPage) && !isAuthenticated) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect authenticated users away from auth pages to dashboard
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

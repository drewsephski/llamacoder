import { NextRequest, NextResponse } from "next/server";

export function getCheckoutString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function checkoutErrorResponse(
  message: string,
  status: number,
  request: NextRequest,
  expectsJson: boolean,
  errorParam = "checkout_error",
) {
  if (expectsJson) {
    return NextResponse.json({ error: message }, { status });
  }

  const redirectUrl = new URL("/dashboard", request.url);
  redirectUrl.searchParams.set(errorParam, message);

  return NextResponse.redirect(redirectUrl, 303);
}

export function checkoutSuccessResponse(url: string, expectsJson: boolean) {
  if (expectsJson) {
    return NextResponse.json({ url });
  }

  return NextResponse.redirect(url, 303);
}

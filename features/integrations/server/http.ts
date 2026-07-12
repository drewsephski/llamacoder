import "server-only";

import { NextResponse } from "next/server";

import { IntegrationServiceError } from "@/features/integrations/server/service";

export function integrationErrorResponse(error: unknown) {
  if (error instanceof IntegrationServiceError) {
    return NextResponse.json(
      { error: error.code, message: error.message },
      { status: error.status },
    );
  }

  console.error("Integration request failed:", error);
  const credentialConfigurationError =
    error instanceof Error &&
    error.message.startsWith("INTEGRATION_ENCRYPTION_KEY");
  return NextResponse.json(
    {
      error: credentialConfigurationError
        ? "CREDENTIAL_STORAGE_UNAVAILABLE"
        : "INTEGRATION_REQUEST_FAILED",
      message: credentialConfigurationError
        ? "Secure credential storage is not configured."
        : "The integration request could not be completed.",
    },
    { status: credentialConfigurationError ? 503 : 500 },
  );
}

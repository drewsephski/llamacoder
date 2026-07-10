import { z } from "zod";

const apiErrorSchema = z.object({
  error: z.string().optional(),
  message: z.string().optional(),
});

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fetchJson<T>(
  input: RequestInfo | URL,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, init);
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const parsedError = apiErrorSchema.safeParse(body);
    throw new ApiError(
      parsedError.success
        ? parsedError.data.message || parsedError.data.error || "Request failed"
        : "Request failed",
      parsedError.success
        ? parsedError.data.error || "REQUEST_FAILED"
        : "REQUEST_FAILED",
      response.status,
    );
  }

  return schema.parse(body);
}

import { createAuthClient } from "better-auth/react";

// Use relative URL so it works on any domain (localhost or production)
// This works because the auth API is on the same origin
export const authClient = createAuthClient({
  baseURL: "",
});

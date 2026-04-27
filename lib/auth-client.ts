import { createAuthClient } from "better-auth/react";

// Domains: localhost:3000 and squidcoder.vercel.app
// Using relative URL so it works on any domain (localhost or production)
// This works because the auth API is on the same origin
export const authClient = createAuthClient({
  baseURL: "",
});

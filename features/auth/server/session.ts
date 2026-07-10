import "server-only";

import { headers } from "next/headers";
import { cache } from "react";

import { auth } from "@/lib/auth";

export const getCurrentSession = cache(async () =>
  auth.api.getSession({
    headers: await headers(),
  }),
);

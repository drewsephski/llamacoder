import { PrismaClient } from "@prisma/client";
import { cache } from "react";

const prismaClientSingleton = new PrismaClient();

export const getPrisma = cache(() => {
  return prismaClientSingleton;
});

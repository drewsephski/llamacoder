import "server-only";

import { getPrisma } from "@/lib/prisma";

export function findOwnedProjectWithMessages(
  projectId: string,
  userId: string,
) {
  return getPrisma()
    .chat.findUnique({
      where: { id: projectId },
      include: { messages: true },
    })
    .then((project) => {
      if (project && project.userId !== userId) {
        throw new Error("You do not have access to this project");
      }
      return project;
    });
}

import "server-only";

import { createHash } from "node:crypto";
import { z } from "zod";

import type { ExportBundle } from "@/lib/export-bundle";
import {
  getAuthorizedProjectIntegration,
  providerFetch,
} from "@/features/integrations/server/provider-client";

const projectsSchema = z.object({
  projects: z.array(z.object({ id: z.string(), name: z.string() })),
});
const deploymentSchema = z.object({
  id: z.string(),
  url: z.string().nullable().optional(),
  readyState: z.string().optional(),
});

function withTeam(path: string, teamId: unknown) {
  const url = new URL(path, "https://api.vercel.com");
  if (typeof teamId === "string" && teamId)
    url.searchParams.set("teamId", teamId);
  return url.toString();
}

export async function listVercelProjects(input: {
  projectId: string;
  bindingId: string;
  userId: string;
}) {
  const authorized = await getAuthorizedProjectIntegration({
    ...input,
    expectedProvider: "vercel",
  });
  const body = await providerFetch(
    "vercel",
    authorized.accessToken,
    withTeam("/v9/projects?limit=100", authorized.metadata.teamId),
  );
  return projectsSchema.parse(body).projects.map((project) => ({
    id: project.id,
    name: project.name,
  }));
}

export async function deployVercelBundle({
  projectId,
  bindingId,
  userId,
  vercelProjectId,
  target,
  bundle,
}: {
  projectId: string;
  bindingId: string;
  userId: string;
  vercelProjectId?: string;
  target: "preview" | "production";
  bundle: ExportBundle;
}) {
  const authorized = await getAuthorizedProjectIntegration({
    projectId,
    bindingId,
    userId,
    expectedProvider: "vercel",
  });
  const uploadedFiles: Array<{ file: string; sha: string; size: number }> = [];
  for (let index = 0; index < bundle.files.length; index += 8) {
    const batch = bundle.files.slice(index, index + 8);
    uploadedFiles.push(
      ...(await Promise.all(
        batch.map(async (file) => {
          const content = Buffer.from(file.content, "utf8");
          const sha = createHash("sha1").update(content).digest("hex");
          await providerFetch(
            "vercel",
            authorized.accessToken,
            withTeam("/v2/now/files", authorized.metadata.teamId),
            {
              method: "POST",
              headers: {
                "Content-Type": "application/octet-stream",
                "x-vercel-digest": sha,
              },
              body: content,
            },
          );
          return { file: file.path, sha, size: content.byteLength };
        }),
      )),
    );
  }
  const body = await providerFetch(
    "vercel",
    authorized.accessToken,
    withTeam("/v13/deployments", authorized.metadata.teamId),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: bundle.packageName,
        ...(vercelProjectId ? { project: vercelProjectId } : {}),
        ...(target === "production" ? { target: "production" } : {}),
        files: uploadedFiles,
        projectSettings: {
          framework: "vite",
          buildCommand: "pnpm build",
          outputDirectory: "dist",
          installCommand: "pnpm install",
        },
      }),
    },
  );
  const deployment = deploymentSchema.parse(body);
  return {
    operationStatus: "running" as const,
    externalId: deployment.id,
    url: deployment.url ? `https://${deployment.url}` : null,
    metadata: {
      target,
      projectId: vercelProjectId ?? null,
      readyState: deployment.readyState ?? "QUEUED",
      fileCount: bundle.files.length,
    },
  };
}

import "server-only";

import { z } from "zod";

import type { ExportBundle } from "@/lib/export-bundle";
import {
  getAuthorizedProjectIntegration,
  providerFetch,
} from "@/features/integrations/server/provider-client";
import { IntegrationServiceError } from "@/features/integrations/server/service";

const repositoriesSchema = z.object({
  repositories: z.array(
    z.object({
      id: z.number(),
      full_name: z.string(),
      html_url: z.string().url(),
    }),
  ),
});
const oauthRepositoriesSchema = z.array(
  z.object({
    id: z.number(),
    full_name: z.string(),
    html_url: z.string().url(),
  }),
);
const repositorySchema = z.object({ default_branch: z.string() });
const refSchema = z.object({ object: z.object({ sha: z.string() }) });
const commitSchema = z.object({ tree: z.object({ sha: z.string() }) });
const shaSchema = z.object({ sha: z.string() });

function githubUrl(path: string) {
  return `https://api.github.com${path}`;
}

export async function listGitHubRepositories(input: {
  projectId: string;
  bindingId: string;
  userId: string;
}) {
  const authorized = await getAuthorizedProjectIntegration({
    ...input,
    expectedProvider: "github",
  });
  const installationId = authorized.metadata.installationId;
  const body = await providerFetch(
    "github",
    authorized.accessToken,
    installationId
      ? githubUrl("/installation/repositories?per_page=100")
      : githubUrl(
          "/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member",
        ),
  );
  const repositories = installationId
    ? repositoriesSchema.parse(body).repositories
    : oauthRepositoriesSchema.parse(body);
  return repositories.map((repository) => ({
    id: repository.full_name,
    name: repository.full_name,
    owner: repository.full_name.split("/")[0],
    url: repository.html_url,
  }));
}

async function getRefOrNull(
  token: string,
  owner: string,
  repo: string,
  branch: string,
) {
  const response = await fetch(
    githubUrl(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/ref/heads/${branch
        .split("/")
        .map(encodeURIComponent)
        .join("/")}`,
    ),
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    },
  );
  if (response.status === 404 || response.status === 409) return null;
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new IntegrationServiceError(
      "GITHUB_REQUEST_FAILED",
      "GitHub could not read the repository branch.",
      502,
    );
  }
  return refSchema.parse(body).object.sha;
}

export async function publishGitHubBundle({
  projectId,
  bindingId,
  userId,
  repository,
  branch,
  bundle,
}: {
  projectId: string;
  bindingId: string;
  userId: string;
  repository: string;
  branch: string;
  bundle: ExportBundle;
}) {
  const [owner, repo] = repository.split("/");
  if (!owner || !repo) {
    throw new IntegrationServiceError(
      "INVALID_REPOSITORY",
      "Choose a valid GitHub repository.",
      400,
    );
  }
  const { accessToken } = await getAuthorizedProjectIntegration({
    projectId,
    bindingId,
    userId,
    expectedProvider: "github",
  });
  const repoBase = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  const repositoryInfo = repositorySchema.parse(
    await providerFetch("github", accessToken, githubUrl(repoBase)),
  );
  const defaultSha = await getRefOrNull(
    accessToken,
    owner,
    repo,
    repositoryInfo.default_branch,
  );
  if (!defaultSha) {
    throw new IntegrationServiceError(
      "EMPTY_REPOSITORY_UNSUPPORTED",
      "Initialize the repository with a README before publishing from Squid.",
      409,
    );
  }
  const existingBranchSha = await getRefOrNull(
    accessToken,
    owner,
    repo,
    branch,
  );
  const parentSha = existingBranchSha ?? defaultSha;
  const parentCommit = commitSchema.parse(
    await providerFetch(
      "github",
      accessToken,
      githubUrl(`${repoBase}/git/commits/${encodeURIComponent(parentSha)}`),
    ),
  );
  const treeEntries = await Promise.all(
    bundle.files.map(async (file) => {
      const blob = shaSchema.parse(
        await providerFetch(
          "github",
          accessToken,
          githubUrl(`${repoBase}/git/blobs`),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: file.content, encoding: "utf-8" }),
          },
        ),
      );
      return {
        path: file.path.replace(/^\/+/, ""),
        mode: "100644",
        type: "blob",
        sha: blob.sha,
      };
    }),
  );
  const tree = shaSchema.parse(
    await providerFetch(
      "github",
      accessToken,
      githubUrl(`${repoBase}/git/trees`),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base_tree: parentCommit.tree.sha,
          tree: treeEntries,
        }),
      },
    ),
  );
  const commit = shaSchema.parse(
    await providerFetch(
      "github",
      accessToken,
      githubUrl(`${repoBase}/git/commits`),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Publish ${bundle.appTitle} from Squid Agent`,
          tree: tree.sha,
          parents: [parentSha],
        }),
      },
    ),
  );
  if (existingBranchSha) {
    await providerFetch(
      "github",
      accessToken,
      githubUrl(
        `${repoBase}/git/refs/heads/${branch.split("/").map(encodeURIComponent).join("/")}`,
      ),
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sha: commit.sha, force: false }),
      },
    );
  } else {
    await providerFetch(
      "github",
      accessToken,
      githubUrl(`${repoBase}/git/refs`),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: commit.sha }),
      },
    );
  }
  return {
    operationStatus: "succeeded" as const,
    externalId: commit.sha,
    commitSha: commit.sha,
    url: `https://github.com/${owner}/${repo}/tree/${encodeURIComponent(branch)}`,
    metadata: { repository, branch, fileCount: bundle.files.length },
  };
}

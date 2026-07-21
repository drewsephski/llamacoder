import { z } from "zod";

export const integrationEnvironmentSchema = z.enum([
  "development",
  "production",
]);
export type IntegrationEnvironment = z.infer<
  typeof integrationEnvironmentSchema
>;

export const integrationConnectionStatusSchema = z.enum([
  "authorization_required",
  "configured",
  "ready",
  "needs_attention",
  "blocked",
]);

export const integrationCredentialInputSchema = z.object({
  kind: z.enum(["api_key", "access_token"]),
  value: z.string().trim().min(8).max(16_384),
});

export const createProjectIntegrationSchema = z.object({
  providerId: z.string().trim().min(1).max(80),
  environment: integrationEnvironmentSchema,
  displayName: z.string().trim().min(1).max(80).optional(),
  credential: integrationCredentialInputSchema.optional(),
});

export const updateProjectIntegrationSchema = z
  .object({
    displayName: z.string().trim().min(1).max(80).optional(),
    credential: integrationCredentialInputSchema.optional(),
    config: z.record(z.string(), z.unknown()).optional(),
  })
  .refine((value) => value.displayName || value.credential || value.config, {
    message: "Provide a display name, credential, or configuration to update.",
  });

export const integrationProviderSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum([
    "data",
    "developer",
    "backend",
    "commerce",
    "communication",
    "deployment",
  ]),
  description: z.string(),
  capabilities: z.array(z.string()),
  auth: z.enum(["none", "publishable_key", "secret", "oauth"]),
  runtime: z.enum(["browser", "server"]),
  policyStatus: z.enum(["approved", "conditional", "blocked"]),
  commercialUse: z.enum(["allowed", "restricted", "review_required"]),
  docsUrl: z.string().url(),
  guidance: z.string(),
  attribution: z.string().nullable(),
  limits: z.string().nullable(),
  exampleEndpoint: z.string().url().nullable(),
  verifiedAt: z.string(),
  setup: z.enum(["instant", "api_key", "oauth", "blocked"]),
  healthCheckAvailable: z.boolean(),
  credentialKind: z.enum(["api_key", "access_token"]).nullable(),
  oauthAvailable: z.boolean(),
});

export const projectIntegrationSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  providerId: z.string(),
  environment: integrationEnvironmentSchema,
  status: integrationConnectionStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  config: z.record(z.string(), z.unknown()).nullable().default(null),
  connection: z.object({
    id: z.string(),
    displayName: z.string(),
    authType: z.string(),
    status: integrationConnectionStatusSchema,
    hasCredential: z.boolean(),
    lastHealthStatus: z.string().nullable(),
    lastHealthMessage: z.string().nullable(),
    lastHealthCheckAt: z.string().nullable(),
  }),
});

export const integrationOperationSchema = z.object({
  id: z.string(),
  projectIntegrationId: z.string(),
  providerId: z.string(),
  kind: z.string(),
  status: z.string(),
  externalId: z.string().nullable(),
  url: z.string().nullable(),
  commitSha: z.string().nullable(),
  errorMessage: z.string().nullable(),
  createdAt: z.string(),
  completedAt: z.string().nullable(),
});

export const integrationWorkspaceSchema = z.object({
  providers: z.array(integrationProviderSummarySchema),
  integrations: z.array(projectIntegrationSchema),
  recentOperations: z.array(integrationOperationSchema).default([]),
});

export const integrationMutationResponseSchema = z.object({
  integration: projectIntegrationSchema,
});

export type IntegrationWorkspace = z.infer<typeof integrationWorkspaceSchema>;
export type IntegrationProviderSummary = z.infer<
  typeof integrationProviderSummarySchema
>;
export type ProjectIntegrationView = z.infer<typeof projectIntegrationSchema>;

export const integrationResourcesResponseSchema = z.object({
  resources: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      owner: z.string().optional(),
      url: z.string().url().optional(),
    }),
  ),
});

export const integrationActionInputSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("github_publish"),
    messageId: z.string().min(1),
    repository: z.string().regex(/^[^/]+\/[^/]+$/),
    branch: z.string().trim().min(1).max(200).default("squid/generated"),
  }),
  z.object({
    action: z.literal("vercel_deploy"),
    messageId: z.string().min(1),
    projectId: z.string().optional(),
    target: z.enum(["preview", "production"]).default("preview"),
  }),
  z.object({
    action: z.literal("supabase_provision"),
    messageId: z.string().min(1).optional(),
    organizationId: z.string().trim().min(1).optional(),
    projectName: z.string().trim().min(1).max(120).optional(),
    region: z.string().trim().min(1).max(64).optional(),
  }),
]);

export const integrationActionResponseSchema = z.object({
  operation: integrationOperationSchema,
});

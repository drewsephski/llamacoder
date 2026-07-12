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
  })
  .refine((value) => value.displayName || value.credential, {
    message: "Provide a display name or credential to update.",
  });

export const integrationProviderSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  capabilities: z.array(z.string()),
  auth: z.enum(["none", "publishable_key", "secret", "oauth"]),
  runtime: z.enum(["browser", "server"]),
  policyStatus: z.enum(["approved", "conditional", "blocked"]),
  commercialUse: z.enum(["allowed", "restricted", "review_required"]),
  docsUrl: z.string().url(),
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

export const integrationWorkspaceSchema = z.object({
  providers: z.array(integrationProviderSummarySchema),
  integrations: z.array(projectIntegrationSchema),
});

export const integrationMutationResponseSchema = z.object({
  integration: projectIntegrationSchema,
});

export type IntegrationWorkspace = z.infer<typeof integrationWorkspaceSchema>;
export type ProjectIntegrationView = z.infer<typeof projectIntegrationSchema>;

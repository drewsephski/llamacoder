-- OAuth completion and refresh now use IntegrationCredential encryption. Remove
-- any historical plaintext copies; fail closed when no encrypted token exists.
WITH legacy_connections AS (
  SELECT
    connection."id",
    NOT EXISTS (
      SELECT 1
      FROM "IntegrationCredential" credential
      WHERE credential."connectionId" = connection."id"
        AND credential."kind" = 'refresh_token'
    ) AS "requiresReauthorization"
  FROM "IntegrationConnection" connection
  WHERE connection."providerId" = 'supabase'
    AND connection."metadata" ? 'supabaseRefreshToken'
),
updated_bindings AS (
  UPDATE "ProjectIntegration" binding
  SET "status" = 'authorization_required'
  FROM legacy_connections legacy
  WHERE binding."connectionId" = legacy."id"
    AND legacy."requiresReauthorization"
  RETURNING binding."id"
),
updated_connections AS (
  UPDATE "IntegrationConnection" connection
  SET
    "metadata" = connection."metadata" - 'supabaseRefreshToken',
    "status" = CASE
      WHEN legacy."requiresReauthorization" THEN 'authorization_required'
      ELSE connection."status"
    END,
    "lastHealthStatus" = CASE
      WHEN legacy."requiresReauthorization" THEN 'failed'
      ELSE connection."lastHealthStatus"
    END,
    "lastHealthMessage" = CASE
      WHEN legacy."requiresReauthorization"
        THEN 'Reconnect Supabase to restore Management API access.'
      ELSE connection."lastHealthMessage"
    END,
    "lastHealthCheckAt" = CASE
      WHEN legacy."requiresReauthorization" THEN CURRENT_TIMESTAMP
      ELSE connection."lastHealthCheckAt"
    END
  FROM legacy_connections legacy
  WHERE connection."id" = legacy."id"
  RETURNING connection."id"
)
SELECT COUNT(*) FROM updated_connections;

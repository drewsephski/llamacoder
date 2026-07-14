CREATE TABLE "OperationalIncident" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "level" TEXT NOT NULL,
  "operation" TEXT,
  "status" TEXT,
  "userId" TEXT,
  "errorName" TEXT,
  "errorMessage" TEXT,
  "metadata" JSONB,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "OperationalIncident_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OperationalIncident_level_createdAt_idx"
ON "OperationalIncident"("level", "createdAt");

CREATE INDEX "OperationalIncident_name_createdAt_idx"
ON "OperationalIncident"("name", "createdAt");

CREATE INDEX "OperationalIncident_resolvedAt_createdAt_idx"
ON "OperationalIncident"("resolvedAt", "createdAt");

-- CreateEnum
CREATE TYPE "project_status" AS ENUM ('TARGET', 'PENDING', 'ONGOING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "project_priority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "status" "project_status" NOT NULL DEFAULT 'TARGET',
    "priority" "project_priority" NOT NULL DEFAULT 'NORMAL',
    "start_date" DATE,
    "due_date" DATE,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "projects_progress_check" CHECK ("progress" BETWEEN 0 AND 100),
    CONSTRAINT "projects_date_order_check" CHECK (
        "start_date" IS NULL OR "due_date" IS NULL OR "start_date" <= "due_date"
    )
);

-- CreateIndex
CREATE INDEX "projects_owner_id_status_idx" ON "projects"("owner_id", "status");

-- CreateIndex
CREATE INDEX "projects_owner_id_updated_at_idx" ON "projects"("owner_id", "updated_at" DESC);

-- Restrict each signed-in user to their own project rows.
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "projects" FORCE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "projects" TO authenticated;

CREATE POLICY "projects_owner_access"
ON "projects"
FOR ALL
TO authenticated
USING ("owner_id" = (SELECT auth.uid()))
WITH CHECK ("owner_id" = (SELECT auth.uid()));

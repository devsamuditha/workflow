-- CreateTable
CREATE TABLE "reminders" (
    "id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "reminders_title_check" CHECK (char_length(btrim("title")) > 0)
);

-- CreateIndex
CREATE INDEX "reminders_owner_id_date_idx" ON "reminders"("owner_id", "date");

-- Keep each user's reminders isolated at the database layer.
ALTER TABLE "reminders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reminders" FORCE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "reminders" TO authenticated;

CREATE POLICY "reminders_owner_access"
ON "reminders"
FOR ALL
TO authenticated
USING ("owner_id" = (SELECT auth.uid()))
WITH CHECK ("owner_id" = (SELECT auth.uid()));

-- Column already exists in the database (added manually earlier).
-- This file only exists so Prisma's migration history matches reality.
ALTER TABLE "Accommodation" ADD COLUMN IF NOT EXISTS "photos" TEXT[] NOT NULL DEFAULT '{}';
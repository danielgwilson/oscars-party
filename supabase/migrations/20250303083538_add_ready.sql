-- Add is_ready column to players table
ALTER TABLE "public"."players" ADD COLUMN "is_ready" BOOLEAN DEFAULT false;
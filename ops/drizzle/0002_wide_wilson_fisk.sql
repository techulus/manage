ALTER TABLE "Organization" ADD COLUMN "markedForDeletionAt" timestamp;--> statement-breakpoint
ALTER TABLE "Organization" ADD COLUMN "finalWarningAt" timestamp;
ALTER TABLE "Document" RENAME COLUMN "markdownContent" TO "htmlContent";--> statement-breakpoint
ALTER TABLE "Document" ADD COLUMN "metadata" jsonb NOT NULL;
ALTER TABLE "Document" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "DocumentFolder" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "Document" CASCADE;--> statement-breakpoint
DROP TABLE "DocumentFolder" CASCADE;--> statement-breakpoint
--> statement-breakpoint
ALTER TABLE "Blob" DROP COLUMN "documentFolderId";
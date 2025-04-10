ALTER TABLE "Blob" ADD COLUMN "blockId" text;--> statement-breakpoint
ALTER TABLE "Comment" ADD COLUMN "roomId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "Comment" ADD COLUMN "metadata" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "Comment" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "Comment" DROP COLUMN "parentId";--> statement-breakpoint
ALTER TABLE "Blob" ADD CONSTRAINT "Blob_blockId_unique" UNIQUE("blockId");
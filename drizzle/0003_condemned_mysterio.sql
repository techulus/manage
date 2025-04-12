ALTER TABLE "Activity" ADD COLUMN "oldValue" jsonb;--> statement-breakpoint
ALTER TABLE "Activity" ADD COLUMN "newValue" jsonb;--> statement-breakpoint
ALTER TABLE "Activity" ADD COLUMN "target" text;--> statement-breakpoint
ALTER TABLE "Activity" DROP COLUMN "message";
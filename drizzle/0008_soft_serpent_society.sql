CREATE TABLE "Post" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "Post_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" text NOT NULL,
	"content" text,
	"metadata" jsonb,
	"category" text NOT NULL,
	"isDraft" boolean DEFAULT true NOT NULL,
	"publishedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"projectId" integer NOT NULL,
	"createdByUser" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Post" ADD CONSTRAINT "Post_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Post" ADD CONSTRAINT "Post_createdByUser_User_id_fk" FOREIGN KEY ("createdByUser") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;
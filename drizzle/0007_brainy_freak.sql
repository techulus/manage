CREATE TABLE "ProjectPermission" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ProjectPermission_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"projectId" integer NOT NULL,
	"userId" text NOT NULL,
	"role" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"createdByUser" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ProjectPermission" ADD CONSTRAINT "ProjectPermission_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ProjectPermission" ADD CONSTRAINT "ProjectPermission_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ProjectPermission" ADD CONSTRAINT "ProjectPermission_createdByUser_User_id_fk" FOREIGN KEY ("createdByUser") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;
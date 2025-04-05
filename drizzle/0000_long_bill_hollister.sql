CREATE TABLE "Activity" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "Activity_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"action" text NOT NULL,
	"type" text NOT NULL,
	"message" text,
	"projectId" integer NOT NULL,
	"userId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Blob" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"contentType" text NOT NULL,
	"contentSize" integer NOT NULL,
	"createdByUser" text NOT NULL,
	"documentFolderId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Blob_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "Event" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "Event_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"description" text,
	"start" timestamp NOT NULL,
	"end" timestamp,
	"allDay" boolean DEFAULT false NOT NULL,
	"repeatRule" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"projectId" integer NOT NULL,
	"createdByUser" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Comment" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "Comment_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"createdByUser" text NOT NULL,
	"type" text NOT NULL,
	"parentId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Document" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "Document_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"markdownContent" text NOT NULL,
	"status" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"projectId" integer NOT NULL,
	"folderId" integer,
	"createdByUser" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "DocumentFolder" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "DocumentFolder_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"description" text,
	"projectId" integer NOT NULL,
	"createdByUser" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "CalendarEventInvite" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "CalendarEventInvite_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"eventId" integer NOT NULL,
	"userId" text NOT NULL,
	"status" text,
	"invitedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Notification" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "Notification_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"type" text,
	"message" text NOT NULL,
	"target" text,
	"read" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"fromUser" text,
	"toUser" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Project" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "Project_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"description" text,
	"status" text NOT NULL,
	"dueDate" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"createdByUser" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Task" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "Task_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"taskListId" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" text NOT NULL,
	"dueDate" timestamp,
	"position" real NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"assignedToUser" text,
	"createdByUser" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "TaskList" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "TaskList_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"description" text,
	"status" text NOT NULL,
	"dueDate" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"projectId" integer NOT NULL,
	"createdByUser" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"firstName" text,
	"lastName" text,
	"imageUrl" text,
	"timeZone" text,
	"rawData" jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "User_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Blob" ADD CONSTRAINT "Blob_createdByUser_User_id_fk" FOREIGN KEY ("createdByUser") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Blob" ADD CONSTRAINT "Blob_documentFolderId_DocumentFolder_id_fk" FOREIGN KEY ("documentFolderId") REFERENCES "public"."DocumentFolder"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Event" ADD CONSTRAINT "Event_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdByUser_User_id_fk" FOREIGN KEY ("createdByUser") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_createdByUser_User_id_fk" FOREIGN KEY ("createdByUser") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Document" ADD CONSTRAINT "Document_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Document" ADD CONSTRAINT "Document_folderId_DocumentFolder_id_fk" FOREIGN KEY ("folderId") REFERENCES "public"."DocumentFolder"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Document" ADD CONSTRAINT "Document_createdByUser_User_id_fk" FOREIGN KEY ("createdByUser") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "DocumentFolder" ADD CONSTRAINT "DocumentFolder_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "DocumentFolder" ADD CONSTRAINT "DocumentFolder_createdByUser_User_id_fk" FOREIGN KEY ("createdByUser") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "CalendarEventInvite" ADD CONSTRAINT "CalendarEventInvite_eventId_Event_id_fk" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "CalendarEventInvite" ADD CONSTRAINT "CalendarEventInvite_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_fromUser_User_id_fk" FOREIGN KEY ("fromUser") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_toUser_User_id_fk" FOREIGN KEY ("toUser") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Project" ADD CONSTRAINT "Project_createdByUser_User_id_fk" FOREIGN KEY ("createdByUser") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Task" ADD CONSTRAINT "Task_taskListId_TaskList_id_fk" FOREIGN KEY ("taskListId") REFERENCES "public"."TaskList"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedToUser_User_id_fk" FOREIGN KEY ("assignedToUser") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdByUser_User_id_fk" FOREIGN KEY ("createdByUser") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "TaskList" ADD CONSTRAINT "TaskList_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "TaskList" ADD CONSTRAINT "TaskList_createdByUser_User_id_fk" FOREIGN KEY ("createdByUser") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;
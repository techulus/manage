CREATE TABLE "User" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"firstName" text,
	"lastName" text,
	"imageUrl" text,
	"timeZone" text,
	"rawData" jsonb NOT NULL,
	"lastActiveAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "User_email_unique" UNIQUE("email")
);

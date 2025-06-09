CREATE TABLE "Organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"rawData" jsonb NOT NULL,
	"lastActiveAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);

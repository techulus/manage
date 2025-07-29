import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const opsUser = pgTable("User", {
	id: text("id").primaryKey().notNull(),
	email: text("email").notNull().unique(),
	firstName: text("firstName"),
	lastName: text("lastName"),
	imageUrl: text("imageUrl"),
	timeZone: text("timeZone"),
	rawData: jsonb("rawData").notNull(),
	lastActiveAt: timestamp(),
	markedForDeletionAt: timestamp(),
	finalWarningAt: timestamp(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
});

export const opsOrganization = pgTable("Organization", {
	id: text("id").primaryKey().notNull(),
	name: text("name").notNull(),
	rawData: jsonb("rawData").notNull(),
	lastActiveAt: timestamp(),
	markedForDeletionAt: timestamp(),
	finalWarningAt: timestamp(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
});

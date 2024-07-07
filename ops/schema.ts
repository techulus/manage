import {
  integer,
  sqliteTable,
  text
} from "drizzle-orm/sqlite-core";

export const _user = sqliteTable("User", {
  id: text("id").primaryKey().notNull(),
  email: text("email").notNull().unique(),
  lastActiveAt: integer("lastActiveAt", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});
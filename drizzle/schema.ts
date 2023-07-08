import { Organization, User } from "@clerk/nextjs/dist/types/server";
import { relations } from "drizzle-orm";
import {
  customType,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const dbJson = customType({
  dataType: () => "text", // must be text for sqlite3 json operators to work
  toDriver: (value: any) => {
    return JSON.stringify(value);
  },
  fromDriver: (value: any) => {
    return JSON.parse(value);
  },
});

export const user = sqliteTable(
  "User",
  {
    id: text("id").primaryKey().notNull(),
    email: text("email").notNull(),
    firstName: text("firstName"),
    lastName: text("lastName"),
    imageUrl: text("imageUrl"),
    rawData: dbJson("rawData").notNull().$type<User>(),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  },
  (table) => {
    return {
      emailKey: uniqueIndex("User_email_key").on(table.email),
    };
  }
);

export const userRelations = relations(user, ({ many }) => ({
  organizations: many(organization),
  projects: many(project),
  documents: many(document),
  taskLists: many(taskList),
  tasks: many(task),
}));

export const organization = sqliteTable("Organization", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  imageUrl: text("imageUrl"),
  logoUrl: text("logoUrl"),
  rawData: dbJson("rawData").notNull().$type<Organization | User>(),
  createdByUser: text("createdByUser")
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const organizationRelations = relations(
  organization,
  ({ many, one }) => ({
    user: one(user, {
      fields: [organization.createdByUser],
      references: [user.id],
    }),
    projects: many(project),
  })
);

export const project = sqliteTable("Project", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull(),
  dueDate: integer("dueDate", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  organizationId: text("organizationId")
    .notNull()
    .references(() => organization.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  createdByUser: text("createdByUser")
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
});

export const projectRelations = relations(project, ({ many, one }) => ({
  user: one(user, {
    fields: [project.createdByUser],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [project.organizationId],
    references: [organization.id],
  }),
  taskLists: many(taskList),
  documents: many(document),
}));

export const document = sqliteTable("Document", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  markdownContent: text("markdownContent").notNull(),
  status: text("status").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  projectId: integer("projectId")
    .notNull()
    .references(() => project.id, { onDelete: "cascade", onUpdate: "cascade" }),
  createdByUser: text("createdByUser")
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
});

export const documentRelations = relations(document, ({ one }) => ({
  user: one(user, {
    fields: [document.createdByUser],
    references: [user.id],
  }),
  project: one(project, {
    fields: [document.projectId],
    references: [project.id],
  }),
}));

export const task = sqliteTable("Task", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  taskListId: integer("taskListId")
    .notNull()
    .references(() => taskList.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull(),
  dueDate: integer("dueDate", { mode: "timestamp" }),
  position: real("position").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  assignedToUser: text("assignedToUser").references(() => user.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  createdByUser: text("createdByUser")
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
});

export const taskRelations = relations(task, ({ one }) => ({
  creator: one(user, {
    fields: [task.createdByUser],
    references: [user.id],
  }),
  assignee: one(user, {
    fields: [task.assignedToUser],
    references: [user.id],
  }),
  taskList: one(taskList, {
    fields: [task.taskListId],
    references: [taskList.id],
  }),
}));

export const taskList = sqliteTable("TaskList", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull(),
  dueDate: integer("dueDate", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  projectId: integer("projectId")
    .notNull()
    .references(() => project.id, { onDelete: "cascade", onUpdate: "cascade" }),
  createdByUser: text("createdByUser")
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
});

export const taskListRelations = relations(taskList, ({ many, one }) => ({
  user: one(user, {
    fields: [taskList.createdByUser],
    references: [user.id],
  }),
  project: one(project, {
    fields: [taskList.projectId],
    references: [project.id],
  }),
  tasks: many(task),
}));

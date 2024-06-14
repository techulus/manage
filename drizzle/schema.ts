import { User } from "@clerk/nextjs/dist/types/server";
import { relations } from "drizzle-orm";
import {
  customType,
  integer,
  real,
  sqliteTable,
  text,
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

export const user = sqliteTable("User", {
  id: text("id").primaryKey().notNull(),
  email: text("email").notNull().unique(),
  firstName: text("firstName"),
  lastName: text("lastName"),
  imageUrl: text("imageUrl"),
  rawData: dbJson("rawData").notNull().$type<User>(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const userRelations = relations(user, ({ many }) => ({
  projects: many(project),
  documents: many(document),
  taskLists: many(taskList),
}));

export const project = sqliteTable("Project", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull(),
  dueDate: integer("dueDate", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  createdByUser: text("createdByUser")
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
});

export const projectRelations = relations(project, ({ many, one }) => ({
  creator: one(user, {
    fields: [project.createdByUser],
    references: [user.id],
  }),
  taskLists: many(taskList),
  documents: many(document),
  documentFolders: many(documentFolder),
  events: many(calendarEvent),
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
  folderId: integer("folderId").references(() => documentFolder.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  createdByUser: text("createdByUser")
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
});

export const documentRelations = relations(document, ({ one }) => ({
  creator: one(user, {
    fields: [document.createdByUser],
    references: [user.id],
  }),
  project: one(project, {
    fields: [document.projectId],
    references: [project.id],
  }),
  folder: one(documentFolder, {
    fields: [document.folderId],
    references: [documentFolder.id],
  }),
}));

export const documentFolder = sqliteTable("DocumentFolder", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  projectId: integer("projectId")
    .notNull()
    .references(() => project.id, { onDelete: "cascade", onUpdate: "cascade" }),
  createdByUser: text("createdByUser")
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const documentFolderRelations = relations(
  documentFolder,
  ({ one, many }) => ({
    creator: one(user, {
      fields: [documentFolder.createdByUser],
      references: [user.id],
    }),
    project: one(project, {
      fields: [documentFolder.projectId],
      references: [project.id],
    }),
    documents: many(document),
    files: many(blob),
  })
);

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
    relationName: "creator",
  }),
  assignee: one(user, {
    fields: [task.assignedToUser],
    references: [user.id],
    relationName: "assignee",
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
  creator: one(user, {
    fields: [taskList.createdByUser],
    references: [user.id],
  }),
  project: one(project, {
    fields: [taskList.projectId],
    references: [project.id],
  }),
  tasks: many(task),
}));

export const blob = sqliteTable("Blob", {
  id: text("id").notNull().primaryKey(),
  key: text("key").unique().notNull(),
  name: text("name").notNull(),
  contentType: text("contentType").notNull(),
  contentSize: integer("contentSize").notNull(),
  createdByUser: text("createdByUser")
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
  documentFolderId: integer("documentFolderId").references(
    () => documentFolder.id,
    {
      onDelete: "cascade",
      onUpdate: "cascade",
    }
  ),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const blobsRelations = relations(blob, ({ one }) => ({
  creator: one(user, {
    fields: [blob.createdByUser],
    references: [user.id],
  }),
  folder: one(documentFolder, {
    fields: [blob.documentFolderId],
    references: [documentFolder.id],
  }),
}));

export const calendarEvent = sqliteTable("Event", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  start: integer("start", { mode: "timestamp" }).notNull(),
  end: integer("end", { mode: "timestamp" }).notNull(),
  allDay: integer("allDay", { mode: "boolean" }).notNull().default(false),
  repeatRule: text("repeatRule"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  projectId: integer("projectId")
    .notNull()
    .references(() => project.id, { onDelete: "cascade", onUpdate: "cascade" }),
  createdByUser: text("createdByUser")
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
});

export const calendarEventRelations = relations(calendarEvent, ({ one }) => ({
  creator: one(user, {
    fields: [calendarEvent.createdByUser],
    references: [user.id],
  }),
  project: one(project, {
    fields: [calendarEvent.projectId],
    references: [project.id],
  }),
}));

export const comment = sqliteTable("Comment", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  content: text("content").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  createdByUser: text("createdByUser")
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
  type: text("type").notNull(),
  parentId: integer("parentId").notNull(),
});

export const commentRelations = relations(comment, ({ one }) => ({
  creator: one(user, {
    fields: [comment.createdByUser],
    references: [user.id],
  }),
}));

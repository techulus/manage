import { relations, sql } from "drizzle-orm";
import {
	customType,
	integer,
	real,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";

const dbJson = customType({
	dataType: () => "text", // must be text for sqlite3 json operators to work
	toDriver: (value: unknown) => {
		return JSON.stringify(value);
	},
	fromDriver: (value: unknown) => {
		return JSON.parse(value as string);
	},
});

export const user = sqliteTable("User", {
	id: text("id").primaryKey().notNull(),
	email: text("email").notNull().unique(),
	firstName: text("firstName"),
	lastName: text("lastName"),
	imageUrl: text("imageUrl"),
	timeZone: text("timeZone"),
	rawData: dbJson("rawData").notNull(),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

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
	}),
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
		},
	),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const calendarEvent = sqliteTable("Event", {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	description: text("description"),
	start: integer("start", { mode: "timestamp" }).notNull(),
	end: integer("end", { mode: "timestamp" }),
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

export const eventInvite = sqliteTable("CalendarEventInvite", {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	eventId: integer("eventId")
		.notNull()
		.references(() => calendarEvent.id, {
			onDelete: "cascade",
			onUpdate: "cascade",
		}),
	userId: text("userId")
		.notNull()
		.references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
	status: text("status"),
	invitedAt: integer("createdAt", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});

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

export const activity = sqliteTable("Activity", {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	action: text("action").notNull(),
	type: text("type").notNull(),
	message: text("message"),
	projectId: integer("projectId")
		.notNull()
		.references(() => project.id, { onDelete: "cascade", onUpdate: "cascade" }),
	userId: text("userId")
		.notNull()
		.references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});

export const notification = sqliteTable("Notification", {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	type: text("type"),
	message: text("message").notNull(),
	target: text("target"),
	read: integer("read", { mode: "boolean" }).notNull().default(false),
	createdAt: integer("createdAt", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
	fromUser: text("fromUser").references(() => user.id, {
		onDelete: "cascade",
		onUpdate: "cascade",
	}),
	toUser: text("toUser")
		.notNull()
		.references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
});

export const userRelations = relations(user, ({ many }) => ({
	projects: many(project),
	documents: many(document),
	taskLists: many(taskList),
	events: many(calendarEvent),
	eventInvites: many(eventInvite),
}));

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

export const calendarEventRelations = relations(
	calendarEvent,
	({ one, many }) => ({
		creator: one(user, {
			fields: [calendarEvent.createdByUser],
			references: [user.id],
		}),
		project: one(project, {
			fields: [calendarEvent.projectId],
			references: [project.id],
		}),
		invites: many(eventInvite),
	}),
);

export const eventInviteRelations = relations(eventInvite, ({ one }) => ({
	event: one(calendarEvent, {
		fields: [eventInvite.eventId],
		references: [calendarEvent.id],
	}),
	user: one(user, {
		fields: [eventInvite.userId],
		references: [user.id],
	}),
}));

export const commentRelations = relations(comment, ({ one }) => ({
	creator: one(user, {
		fields: [comment.createdByUser],
		references: [user.id],
	}),
}));

export const activityRelations = relations(activity, ({ one }) => ({
	actor: one(user, {
		fields: [activity.userId],
		references: [user.id],
	}),
	project: one(project, {
		fields: [activity.projectId],
		references: [project.id],
	}),
}));

export const notificationRelations = relations(notification, ({ one }) => ({
	fromUser: one(user, {
		fields: [notification.fromUser],
		references: [user.id],
	}),
	toUser: one(user, {
		fields: [notification.toUser],
		references: [user.id],
	}),
}));

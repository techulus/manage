import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	jsonb,
	pgTable,
	real,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const user = pgTable("User", {
	id: text("id").primaryKey().notNull(),
	email: text("email").notNull().unique(),
	firstName: text("firstName"),
	lastName: text("lastName"),
	imageUrl: text("imageUrl"),
	timeZone: text("timeZone"),
	rawData: jsonb("rawData").notNull(),
	lastActiveAt: timestamp(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
});

export const userRelations = relations(user, ({ many }) => ({
	projects: many(project),
	taskLists: many(taskList),
	events: many(calendarEvent),
	projectPermissions: many(projectPermission, {
		relationName: "permissionUser",
	}),
}));

export const project = pgTable("Project", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	name: text("name").notNull(),
	description: text("description"),
	status: text("status").notNull(),
	dueDate: timestamp(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
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
	events: many(calendarEvent),
	permissions: many(projectPermission),
	posts: many(post),
}));

export const task = pgTable("Task", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	taskListId: integer("taskListId")
		.notNull()
		.references(() => taskList.id, {
			onDelete: "cascade",
			onUpdate: "cascade",
		}),
	name: text("name").notNull(),
	description: text("description"),
	status: text("status").notNull(),
	dueDate: timestamp(),
	position: real("position").notNull(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
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

export const taskList = pgTable("TaskList", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	name: text("name").notNull(),
	description: text("description"),
	status: text("status").notNull(),
	dueDate: timestamp(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
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

export const blob = pgTable("Blob", {
	id: text("id").notNull().primaryKey(),
	key: text("key").unique().notNull(),
	blockId: text("blockId").unique(),
	name: text("name").notNull(),
	contentType: text("contentType").notNull(),
	contentSize: integer("contentSize").notNull(),
	createdByUser: text("createdByUser")
		.notNull()
		.references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
});

export const blobsRelations = relations(blob, ({ one }) => ({
	creator: one(user, {
		fields: [blob.createdByUser],
		references: [user.id],
	}),
}));

export const calendarEvent = pgTable("Event", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	name: text("name").notNull(),
	description: text("description"),
	start: timestamp().notNull(),
	end: timestamp(),
	allDay: boolean("allDay").notNull().default(false),
	repeatRule: text("repeatRule"),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
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

export const comment = pgTable("Comment", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	roomId: text("roomId").notNull(),
	content: text("content").notNull(),
	metadata: jsonb("metadata").notNull(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
	createdByUser: text("createdByUser")
		.notNull()
		.references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
});

export const commentRelations = relations(comment, ({ one }) => ({
	creator: one(user, {
		fields: [comment.createdByUser],
		references: [user.id],
	}),
}));

export const activity = pgTable("Activity", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	action: text("action").notNull(),
	type: text("type").notNull(),
	oldValue: jsonb("oldValue"),
	newValue: jsonb("newValue"),
	target: text("target"),
	projectId: integer("projectId")
		.notNull()
		.references(() => project.id, { onDelete: "cascade", onUpdate: "cascade" }),
	userId: text("userId")
		.notNull()
		.references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
	createdAt: timestamp().notNull().defaultNow(),
});

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

export const notification = pgTable("Notification", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	type: text("type"),
	message: text("message").notNull(),
	target: text("target"),
	read: boolean("read").notNull().default(false),
	createdAt: timestamp().notNull().defaultNow(),
	fromUser: text("fromUser").references(() => user.id, {
		onDelete: "cascade",
		onUpdate: "cascade",
	}),
	toUser: text("toUser")
		.notNull()
		.references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
});

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

export const projectPermission = pgTable("ProjectPermission", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	projectId: integer("projectId")
		.notNull()
		.references(() => project.id, { onDelete: "cascade", onUpdate: "cascade" }),
	userId: text("userId")
		.notNull()
		.references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
	role: text("role").notNull(), // 'editor' or 'reader'
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
	createdByUser: text("createdByUser")
		.notNull()
		.references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
});

export const projectPermissionRelations = relations(
	projectPermission,
	({ one }) => ({
		project: one(project, {
			fields: [projectPermission.projectId],
			references: [project.id],
		}),
		user: one(user, {
			fields: [projectPermission.userId],
			references: [user.id],
			relationName: "permissionUser",
		}),
		createdBy: one(user, {
			fields: [projectPermission.createdByUser],
			references: [user.id],
			relationName: "permissionCreator",
		}),
	}),
);

export const post = pgTable("Post", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	title: text("title").notNull(),
	content: text("content"),
	metadata: jsonb("metadata"),
	category: text("category").notNull(),
	isDraft: boolean("isDraft").notNull().default(true),
	publishedAt: timestamp("publishedAt"),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
	projectId: integer("projectId")
		.notNull()
		.references(() => project.id, { onDelete: "cascade", onUpdate: "cascade" }),
	createdByUser: text("createdByUser")
		.notNull()
		.references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
});

export const postRelations = relations(post, ({ one }) => ({
	creator: one(user, {
		fields: [post.createdByUser],
		references: [user.id],
	}),
	project: one(project, {
		fields: [post.projectId],
		references: [project.id],
	}),
}));

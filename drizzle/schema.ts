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

export const user = pgTable("user", {
	id: text("id").primaryKey().notNull(),
	name: text("name"),
	email: text("email").notNull().unique(),
	emailVerified: boolean("emailVerified").notNull().default(false),
	image: text("image"),
	firstName: text("firstName"),
	lastName: text("lastName"),
	timeZone: text("timeZone"),
	lastActiveAt: timestamp("lastActiveAt"),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
	updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey().notNull(),
	expiresAt: timestamp("expiresAt").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
	updatedAt: timestamp("updatedAt").notNull().defaultNow(),
	ipAddress: text("ipAddress"),
	userAgent: text("userAgent"),
	userId: text("userId")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	activeOrganizationId: text("activeOrganizationId"),
});

export const account = pgTable("account", {
	id: text("id").primaryKey().notNull(),
	accountId: text("accountId").notNull(),
	providerId: text("providerId").notNull(),
	userId: text("userId")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("accessToken"),
	refreshToken: text("refreshToken"),
	idToken: text("idToken"),
	accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
	refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
	updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey().notNull(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expiresAt").notNull(),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
	updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const organization = pgTable("organization", {
	id: text("id").primaryKey().notNull(),
	name: text("name").notNull(),
	slug: text("slug").unique(),
	logo: text("logo"),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
	metadata: text("metadata"),
});

export const member = pgTable("member", {
	id: text("id").primaryKey().notNull(),
	organizationId: text("organizationId")
		.notNull()
		.references(() => organization.id, { onDelete: "cascade" }),
	userId: text("userId")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	role: text("role").notNull(),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const invitation = pgTable("invitation", {
	id: text("id").primaryKey().notNull(),
	organizationId: text("organizationId")
		.notNull()
		.references(() => organization.id, { onDelete: "cascade" }),
	email: text("email").notNull(),
	role: text("role"),
	status: text("status").notNull(),
	expiresAt: timestamp("expiresAt").notNull(),
	inviterId: text("inviterId")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const userRelations = relations(user, ({ many }) => ({
	projects: many(project),
	taskLists: many(taskList),
	events: many(calendarEvent),
	projectPermissions: many(projectPermission, {
		relationName: "permissionUser",
	}),
	sessions: many(session),
	accounts: many(account),
	memberships: many(member),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));

export const organizationRelations = relations(organization, ({ many }) => ({
	members: many(member),
	invitations: many(invitation),
	projects: many(project),
}));

export const memberRelations = relations(member, ({ one }) => ({
	organization: one(organization, {
		fields: [member.organizationId],
		references: [organization.id],
	}),
	user: one(user, {
		fields: [member.userId],
		references: [user.id],
	}),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
	organization: one(organization, {
		fields: [invitation.organizationId],
		references: [organization.id],
	}),
	inviter: one(user, {
		fields: [invitation.inviterId],
		references: [user.id],
	}),
}));

export const project = pgTable("project", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	name: text("name").notNull(),
	description: text("description"),
	status: text("status").notNull(),
	dueDate: timestamp("dueDate"),
	organizationId: text("organizationId").references(() => organization.id, {
		onDelete: "cascade",
	}),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
	updatedAt: timestamp("updatedAt").notNull().defaultNow(),
	createdByUser: text("createdByUser")
		.notNull()
		.references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
});

export const projectRelations = relations(project, ({ many, one }) => ({
	creator: one(user, {
		fields: [project.createdByUser],
		references: [user.id],
	}),
	organization: one(organization, {
		fields: [project.organizationId],
		references: [organization.id],
	}),
	taskLists: many(taskList),
	events: many(calendarEvent),
	permissions: many(projectPermission),
	posts: many(post),
}));

export const task = pgTable("task", {
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
	dueDate: timestamp("dueDate"),
	position: real("position").notNull(),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
	updatedAt: timestamp("updatedAt").notNull().defaultNow(),
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

export const taskList = pgTable("taskList", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	name: text("name").notNull(),
	description: text("description"),
	status: text("status").notNull(),
	dueDate: timestamp("dueDate"),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
	updatedAt: timestamp("updatedAt").notNull().defaultNow(),
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

export const blob = pgTable("blob", {
	id: text("id").notNull().primaryKey(),
	key: text("key").unique().notNull(),
	blockId: text("blockId").unique(),
	name: text("name").notNull(),
	contentType: text("contentType").notNull(),
	contentSize: integer("contentSize").notNull(),
	createdByUser: text("createdByUser")
		.notNull()
		.references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
	updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const blobsRelations = relations(blob, ({ one }) => ({
	creator: one(user, {
		fields: [blob.createdByUser],
		references: [user.id],
	}),
}));

export const calendarEvent = pgTable("calendarEvent", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	name: text("name").notNull(),
	description: text("description"),
	start: timestamp("start").notNull(),
	end: timestamp("end"),
	allDay: boolean("allDay").notNull().default(false),
	repeatRule: text("repeatRule"),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
	updatedAt: timestamp("updatedAt").notNull().defaultNow(),
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

export const comment = pgTable("comment", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	roomId: text("roomId").notNull(),
	content: text("content").notNull(),
	metadata: jsonb("metadata").notNull(),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
	updatedAt: timestamp("updatedAt").notNull().defaultNow(),
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

export const activity = pgTable("activity", {
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
	createdAt: timestamp("createdAt").notNull().defaultNow(),
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

export const notification = pgTable("notification", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	type: text("type"),
	message: text("message").notNull(),
	target: text("target"),
	read: boolean("read").notNull().default(false),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
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

export const projectPermission = pgTable("projectPermission", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	projectId: integer("projectId")
		.notNull()
		.references(() => project.id, { onDelete: "cascade", onUpdate: "cascade" }),
	userId: text("userId")
		.notNull()
		.references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
	role: text("role").notNull(),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
	updatedAt: timestamp("updatedAt").notNull().defaultNow(),
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

export const post = pgTable("post", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	title: text("title").notNull(),
	content: text("content"),
	metadata: jsonb("metadata"),
	category: text("category").notNull(),
	isDraft: boolean("isDraft").notNull().default(true),
	publishedAt: timestamp("publishedAt"),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
	updatedAt: timestamp("updatedAt").notNull().defaultNow(),
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

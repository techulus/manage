import { relations } from "drizzle-orm";
import { activity, blob, calendarEvent, comment, document, documentFolder, eventInvite, project, task, taskList, user } from "./schema";

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
  })
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
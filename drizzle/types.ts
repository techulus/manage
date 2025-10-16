import type { InferSelectModel } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as dbSchema from "./schema";
import type {
	activity,
	blob,
	calendarEvent,
	notification,
	project,
	task,
	taskList,
	user,
} from "./schema";

export type Database = NodePgDatabase<typeof dbSchema>;

export type User = InferSelectModel<typeof user>;
export type Project = InferSelectModel<typeof project>;
export type TaskList = InferSelectModel<typeof taskList>;
export type Task = InferSelectModel<typeof task>;
export type Blob = InferSelectModel<typeof blob>;
export type CalendarEvent = InferSelectModel<typeof calendarEvent>;
export type Activity = InferSelectModel<typeof activity>;
export type Notification = InferSelectModel<typeof notification>;

export enum TaskListStatus {
	ACTIVE = "active",
	ARCHIVED = "archived",
}

export enum TaskStatus {
	TODO = "todo",
	DONE = "done",
	DELETED = "deleted",
}

export type ProjectWithCreator = Project & { creator: User };

export type TaskWithDetails = Task & {
	creator: {
		firstName: string | null;
		imageUrl: string | null;
	};
	assignee: {
		firstName: string | null;
		imageUrl: string | null;
	} | null;
};

export type TaskListWithTasks = TaskList & {
	tasks: TaskWithDetails[];
};

export type BlobWithCreater = Blob & {
	creator: Pick<User, "firstName" | "imageUrl">;
};

export type EventWithCreator = CalendarEvent & {
	creator: Pick<User, "id" | "firstName" | "imageUrl">;
};

export type ActivityWithActor = Activity & {
	actor: Pick<User, "id" | "firstName" | "imageUrl">;
};

export type NotificationWithUser = Notification & {
	fromUser: Pick<User, "id" | "firstName" | "imageUrl">;
	toUser: Pick<User, "id" | "firstName" | "imageUrl">;
};

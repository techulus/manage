import type { InferSelectModel } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as dbSchema from "./schema";
import type {
	activity,
	blob,
	calendarEvent,
	member,
	notification,
	organization,
	post,
	project,
	session,
	task,
	taskList,
	user,
} from "./schema";

export type Database = PostgresJsDatabase<typeof dbSchema>;

export type User = InferSelectModel<typeof user>;
export type Session = InferSelectModel<typeof session>;
export type Organization = InferSelectModel<typeof organization>;
export type Member = InferSelectModel<typeof member>;
export type Project = InferSelectModel<typeof project>;
export type TaskList = InferSelectModel<typeof taskList>;
export type Task = InferSelectModel<typeof task>;
export type Blob = InferSelectModel<typeof blob>;
export type CalendarEvent = InferSelectModel<typeof calendarEvent>;
export type Activity = InferSelectModel<typeof activity>;
export type Notification = InferSelectModel<typeof notification>;
export type Post = InferSelectModel<typeof post>;

export enum TaskListStatus {
	ACTIVE = "active",
	ARCHIVED = "archived",
}

export enum TaskStatus {
	TODO = "todo",
	DONE = "done",
	DELETED = "deleted",
}

export type PostCategory = "announcement" | "fyi" | "question";

export type ProjectWithCreator = Project & { creator: User };

export type TaskWithDetails = Task & {
	creator: {
		firstName: string | null;
		image: string | null;
	};
	assignee: {
		firstName: string | null;
		image: string | null;
	} | null;
};

export type TaskListWithTasks = TaskList & {
	tasks: TaskWithDetails[];
};

export type BlobWithCreater = Blob & {
	creator: Pick<User, "firstName" | "image">;
};

export type EventWithCreator = CalendarEvent & {
	creator: Pick<User, "id" | "firstName" | "image">;
};

export type ActivityWithActor = Activity & {
	actor: Pick<User, "id" | "firstName" | "image">;
};

export type NotificationWithUser = Notification & {
	fromUser: Pick<User, "id" | "firstName" | "image">;
	toUser: Pick<User, "id" | "firstName" | "image">;
};

export type PostWithCreator = Post & {
	creator: Pick<User, "id" | "firstName" | "lastName" | "image">;
};

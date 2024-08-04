import type { InferSelectModel } from "drizzle-orm";
import type {
	blob,
	calendarEvent,
	document,
	documentFolder,
	eventInvite,
	project,
	task,
	taskList,
	user,
} from "./schema";

export type User = InferSelectModel<typeof user>;
export type Project = InferSelectModel<typeof project>;
export type TaskList = InferSelectModel<typeof taskList>;
export type Task = InferSelectModel<typeof task>;
export type Document = InferSelectModel<typeof document>;
export type DocumentFolder = InferSelectModel<typeof documentFolder>;
export type Blob = InferSelectModel<typeof blob>;
export type CalendarEvent = InferSelectModel<typeof calendarEvent>;
export type EventInvite = InferSelectModel<typeof eventInvite>;

export type ProjectWithCreator = Project & { creator: User };

export type ProjectWithData = Project & {
	taskLists: TaskListWithTasks[];
	documents: DocumentWithCreator[];
	documentFolders: DocumentFolderWithDocuments[];
	events: EventWithInvites[];
};

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

export type FolderWithContents = DocumentFolder & {
	documents: DocumentWithCreator[];
	files: BlobWithCreater[];
};

export type DocumentWithCreator = Document & {
	creator: Pick<User, "firstName" | "imageUrl">;
};

export type DocumentFolderWithDocuments = DocumentFolder & {
	creator: Pick<User, "firstName" | "imageUrl">;
	documents: Pick<Document, "id">[];
	files: Pick<Blob, "id">[];
};

export type BlobWithCreater = Blob & {
	creator: Pick<User, "firstName" | "imageUrl">;
};

export type EventWithCreator = CalendarEvent & {
	creator: Pick<User, "id" | "firstName" | "imageUrl">;
};

export type EventInviteWithUser = EventInvite & {
	user: Pick<User, "firstName" | "imageUrl">;
};

export type EventWithInvites = EventWithCreator & {
	invites: EventInviteWithUser[];
};

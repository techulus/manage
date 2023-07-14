import { InferModel } from "drizzle-orm";
import {
  document,
  documentFolder,
  organization,
  project,
  task,
  taskList,
  user,
} from "./schema";

export type User = InferModel<typeof user>;
export type Organization = InferModel<typeof organization>;
export type Project = InferModel<typeof project>;
export type TaskList = InferModel<typeof taskList>;
export type Task = InferModel<typeof task>;
export type Document = InferModel<typeof document>;
export type DocumentFolder = InferModel<typeof documentFolder>;

export type ProjectWithUser = Project & { user: User };

export type ProjectWithData = Project & {
  taskLists: TaskListWithTasks[];
  documents: Document[];
  documentFolders: DocumentFolder[];
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

export type FolderWithDocuments = DocumentFolder & {
  documents: Document[];
};

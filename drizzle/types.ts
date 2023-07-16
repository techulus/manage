import { InferModel } from "drizzle-orm";
import {
  blob,
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
export type Blob = InferModel<typeof blob>;

export type ProjectWithUser = Project & { user: User };

export type ProjectWithData = Project & {
  taskLists: TaskListWithTasks[];
  documents: DocumentWithUser[];
  documentFolders: DocumentFolderWithDocuments[];
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
  documents: DocumentWithUser[];
  files: Blob[];
};

export type DocumentWithUser = Document & {
  user: Pick<User, "firstName" | "imageUrl">;
};

export type DocumentFolderWithDocuments = DocumentFolder & {
  user: Pick<User, "firstName" | "imageUrl">;
  documents: Pick<Document, "id">[];
};

import { InferModel } from "drizzle-orm";
import { document, project, task, taskList } from "./schema";

export type Project = InferModel<typeof project>;
export type TaskList = InferModel<typeof taskList>;
export type Task = InferModel<typeof task>;
export type Document = InferModel<typeof document>;

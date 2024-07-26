import { InferSelectModel } from "drizzle-orm";
import { organizations } from "./schema";

export type Organization = InferSelectModel<typeof organizations>;

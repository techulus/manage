import type { InferSelectModel } from "drizzle-orm";
import type { organizations } from "./schema";

export type Organization = InferSelectModel<typeof organizations>;

import { createTRPCRouter } from "../init";
import { documentsRouter } from "./documents";
import { eventsRouter } from "./events";
import { projectsRouter } from "./projects";
import { settingsRouter } from "./settings";
import { tasksRouter } from "./tasks";
import { userRouter } from "./user";

export const appRouter = createTRPCRouter({
	user: userRouter,
	settings: settingsRouter,
	projects: projectsRouter,
	tasks: tasksRouter,
	documents: documentsRouter,
	events: eventsRouter,
});

export type AppRouter = typeof appRouter;

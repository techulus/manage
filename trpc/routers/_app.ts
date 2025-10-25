import type { inferRouterOutputs } from "@trpc/server";
import { createTRPCRouter } from "../init";
import { eventsRouter } from "./events";
import { permissionsRouter } from "./permissions";
import { postsRouter } from "./posts";
import { projectsRouter } from "./projects";
import { searchRouter } from "./search";
import { settingsRouter } from "./settings";
import { tasksRouter } from "./tasks";
import { userRouter } from "./user";

export const appRouter = createTRPCRouter({
	user: userRouter,
	settings: settingsRouter,
	projects: projectsRouter,
	tasks: tasksRouter,
	events: eventsRouter,
	posts: postsRouter,
	search: searchRouter,
	permissions: permissionsRouter,
});

export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

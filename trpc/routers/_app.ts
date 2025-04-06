import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { settingsRouter } from "./settings";
import { userRouter } from "./user";

export const appRouter = createTRPCRouter({
	hello: baseProcedure
		.input(
			z.object({
				text: z.string(),
			}),
		)
		.query((opts) => {
			return {
				greeting: `hello ${opts.input.text}`,
			};
		}),
	settings: settingsRouter,
	user: userRouter,
});

export type AppRouter = typeof appRouter;

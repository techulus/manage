import { taskList } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";

export const tasksRouter = createTRPCRouter({
	getListById: baseProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			const data = await ctx.db.query.taskList
				.findFirst({
					where: eq(taskList.id, +input.id),
				})
				.execute();

			if (!data) {
				throw new Error(`TaskList with id ${input.id} not found`);
			}

			return data;
		}),
});

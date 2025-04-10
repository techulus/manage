import { task, taskList } from "@/drizzle/schema";
import { and, asc, eq, or } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

export const tasksRouter = createTRPCRouter({
	getTaskLists: protectedProcedure
		.input(
			z.object({
				projectId: z.number(),
				statuses: z.array(z.string()).optional().default(["active"]),
			}),
		)
		.query(async ({ ctx, input }) => {
			const data = await ctx.db.query.taskList
				.findMany({
					where: and(
						eq(taskList.projectId, input.projectId),
						or(...input.statuses.map((status) => eq(taskList.status, status))),
					),
					with: {
						tasks: {
							orderBy: [asc(task.position)],
						},
					},
				})
				.execute();

			return data;
		}),
	getListById: protectedProcedure
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

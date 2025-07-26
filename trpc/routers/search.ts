import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

export const searchRouter = createTRPCRouter({
	searchQuery: protectedProcedure
		.input(
			z.object({
				query: z.string().min(1),
				type: z.enum(["project", "task", "tasklist", "event"]).optional(),
				projectId: z.number().optional(),
				limit: z.number().min(1).max(50).default(20),
			}),
		)
		.query(async ({ input, ctx }) => {
			const results = await ctx.search.search(input.query, {
				type: input.type,
				projectId: input.projectId,
				limit: input.limit,
			});

			return results;
		}),

	indexAllContent: protectedProcedure.mutation(async ({ ctx }) => {
		await ctx.search.clearIndex();

		const projects = await ctx.db.query.project.findMany();

		await Promise.allSettled(
			projects.map(async (project) => {
				try {
					await ctx.search.indexProject(project);
				} catch (error) {
					console.error(`Failed to index project ${project.id}:`, error);
				}
			}),
		);

		const taskLists = await ctx.db.query.taskList.findMany({
			with: {
				project: true,
			},
		});

		await Promise.allSettled(
			taskLists.map(async (taskList) => {
				try {
					await ctx.search.indexTaskList(taskList, taskList.project);
				} catch (error) {
					console.error(`Failed to index task list ${taskList.id}:`, error);
				}
			}),
		);

		const tasks = await ctx.db.query.task.findMany({
			with: {
				taskList: {
					with: {
						project: true,
					},
				},
			},
		});

		await Promise.allSettled(
			tasks.map(async (task) => {
				try {
					await ctx.search.indexTask(
						task,
						task.taskList,
						task.taskList.project,
					);
				} catch (error) {
					console.error(`Failed to index task ${task.id}:`, error);
				}
			}),
		);

		const events = await ctx.db.query.calendarEvent.findMany({
			with: {
				project: true,
			},
		});

		await Promise.allSettled(
			events.map(async (event) => {
				try {
					await ctx.search.indexEvent(event, event.project);
				} catch (error) {
					console.error(`Failed to index event ${event.id}:`, error);
				}
			}),
		);

		return {
			success: true,
			indexed: {
				projects: projects.length,
				taskLists: taskLists.length,
				tasks: tasks.length,
				events: events.length,
			},
		};
	}),
});

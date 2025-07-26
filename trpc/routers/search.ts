import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { runAndLogError } from "@/lib/error";

export const searchRouter = createTRPCRouter({
	searchQuery: protectedProcedure
		.input(
			z.object({
				query: z.string().min(1),
				type: z.enum(["project", "task", "tasklist", "event"]).optional(),
				projectId: z.number().optional(),
				status: z.string().optional(),
				limit: z.number().min(1).max(50).default(20),
			}),
		)
		.query(async ({ input, ctx }) => {
			const results = await ctx.search.search(input.query, {
				type: input.type,
				projectId: input.projectId,
				status: input.status,
				limit: input.limit,
			});

			return results;
		}),

	indexAllContent: protectedProcedure.mutation(async ({ ctx }) => {
		await ctx.search.clearIndex();

		const projects = await ctx.db.query.project.findMany();

		await Promise.allSettled(
			projects.map((project) =>
				runAndLogError(`indexing project ${project.id}`, async () => {
					await ctx.search.indexProject(project);
				}),
			),
		);

		const taskLists = await ctx.db.query.taskList.findMany({
			with: {
				project: true,
			},
		});

		await Promise.allSettled(
			taskLists.map((taskList) =>
				runAndLogError(`indexing task list ${taskList.id}`, async () => {
					await ctx.search.indexTaskList(taskList, taskList.project);
				}),
			),
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
			tasks.map((task) =>
				runAndLogError(`indexing task ${task.id}`, async () => {
					await ctx.search.indexTask(
						task,
						task.taskList,
						task.taskList.project,
					);
				}),
			),
		);

		const events = await ctx.db.query.calendarEvent.findMany({
			with: {
				project: true,
			},
		});

		await Promise.allSettled(
			events.map((event) =>
				runAndLogError(`indexing event ${event.id}`, async () => {
					await ctx.search.indexEvent(event, event.project);
				}),
			),
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

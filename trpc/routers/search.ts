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

	indexAllContent: protectedProcedure
		.mutation(async ({ ctx }) => {
			// This is a utility endpoint to re-index all content for the current organization
			
			// Clear the existing index first to ensure clean state
			await ctx.search.clearIndex();
			
			// Index all projects
			const projects = await ctx.db.query.project.findMany({
				where: (project, { eq }) => eq(project.createdByUser, ctx.ownerId),
			});

			for (const project of projects) {
				await ctx.search.indexProject(project);
			}

			// Index all task lists with their projects
			const taskLists = await ctx.db.query.taskList.findMany({
				where: (taskList, { eq }) => eq(taskList.createdByUser, ctx.ownerId),
				with: {
					project: true,
				},
			});

			for (const taskList of taskLists) {
				await ctx.search.indexTaskList(taskList, taskList.project);
			}

			// Index all tasks with their task lists and projects
			const tasks = await ctx.db.query.task.findMany({
				where: (task, { eq }) => eq(task.createdByUser, ctx.ownerId),
				with: {
					taskList: {
						with: {
							project: true,
						},
					},
				},
			});

			for (const task of tasks) {
				await ctx.search.indexTask(
					task,
					task.taskList,
					task.taskList.project,
				);
			}

			// Index all events with their projects
			const events = await ctx.db.query.calendarEvent.findMany({
				where: (event, { eq }) => eq(event.createdByUser, ctx.ownerId),
				with: {
					project: true,
				},
			});

			for (const event of events) {
				await ctx.search.indexEvent(event, event.project);
			}

			return { success: true, indexed: {
				projects: projects.length,
				taskLists: taskLists.length,
				tasks: tasks.length,
				events: events.length,
			}};
		}),
});
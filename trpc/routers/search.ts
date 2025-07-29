import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { runAndLogError } from "@/lib/error";
import { getUserProjectIds } from "@/lib/permissions";
import { eq, } from "drizzle-orm";
import { project, } from "@/drizzle/schema";

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
			// Get projects the user has access to via permissions
			const userProjectIds = await getUserProjectIds(ctx.db, ctx.userId);
			
			// Get projects the user created (for backward compatibility)
			const createdProjects = await ctx.db.query.project.findMany({
				where: eq(project.createdByUser, ctx.userId),
				columns: { id: true },
			});
			const createdProjectIds = createdProjects.map(p => p.id);
			
			// Combine both sets of project IDs
			const accessibleProjectIds = [...new Set([...userProjectIds, ...createdProjectIds])];
			
			// If user has no accessible projects, return empty results
			if (accessibleProjectIds.length === 0) {
				return [];
			}
			
			const results = await ctx.search.search(input.query, {
				type: input.type,
				projectId: input.projectId,
				status: input.status,
				limit: input.limit,
			});

			// Filter results to only include content from accessible projects
			const filteredResults = results.filter(result => {
				// For project search results, check if the project ID is accessible
				if (result.type === 'project') {
					return accessibleProjectIds.includes(result.projectId);
				}
				
				// For tasks, tasklists, and events, check if their project is accessible
				return result.projectId && accessibleProjectIds.includes(result.projectId);
			});

			return filteredResults;
		}),

	indexAllContent: protectedProcedure.mutation(async ({ ctx }) => {
		// Only org admins can reindex all content
		if (!ctx.isOrgAdmin) {
			throw new Error("Only organization admins can reindex content");
		}

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

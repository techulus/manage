import { and, eq, ilike, inArray, or } from "drizzle-orm";
import { z } from "zod";
import { calendarEvent, post, project, task, taskList } from "@/drizzle/schema";
import { getUserProjectIds } from "@/lib/permissions";
import { createTRPCRouter, protectedProcedure } from "../init";

interface SearchResult {
	id: string;
	title: string;
	description: string;
	type: "project" | "task" | "tasklist" | "event" | "post";
	status: string;
	projectId: number;
	projectName: string;
}

export const searchRouter = createTRPCRouter({
	searchQuery: protectedProcedure
		.input(
			z.object({
				query: z.string().min(1),
				type: z
					.enum(["project", "task", "tasklist", "event", "post"])
					.optional(),
				projectId: z.number().optional(),
				status: z.string().optional(),
				limit: z.number().min(1).max(50).default(20),
			}),
		)
		.query(async ({ input, ctx }) => {
			let accessibleProjectIds: number[];

			if (ctx.isOrgAdmin) {
				const allProjects = await ctx.db.query.project.findMany({
					columns: { id: true },
				});
				accessibleProjectIds = allProjects.map((p) => p.id);
			} else {
				const userProjectIds = await getUserProjectIds(ctx.db, ctx.userId);

				const createdProjects = await ctx.db.query.project.findMany({
					where: eq(project.createdByUser, ctx.userId),
					columns: { id: true },
				});
				const createdProjectIds = createdProjects.map((p) => p.id);

				accessibleProjectIds = [
					...new Set([...userProjectIds, ...createdProjectIds]),
				];
			}

			if (accessibleProjectIds.length === 0) {
				return [];
			}

			const searchPattern = `%${input.query.trim()}%`;
			const results: SearchResult[] = [];

			const shouldSearchType = (type: string) =>
				!input.type || input.type === type;

			const matchesProjectFilter = (projectId: number) =>
				!input.projectId || input.projectId === projectId;

			const matchesStatusFilter = (status: string) =>
				!input.status || input.status === status;

			if (shouldSearchType("project")) {
				const projectResults = await ctx.db
					.select({
						id: project.id,
						name: project.name,
						description: project.description,
						status: project.status,
					})
					.from(project)
					.where(
						and(
							inArray(project.id, accessibleProjectIds),
							or(
								ilike(project.name, searchPattern),
								ilike(project.description, searchPattern),
							),
						),
					)
					.limit(input.limit);

				for (const p of projectResults) {
					if (matchesProjectFilter(p.id) && matchesStatusFilter(p.status)) {
						results.push({
							id: `project-${p.id}`,
							title: p.name,
							description: p.description || "",
							type: "project",
							status: p.status,
							projectId: p.id,
							projectName: p.name,
						});
					}
				}
			}

			if (shouldSearchType("task")) {
				const taskResults = await ctx.db
					.select({
						id: task.id,
						name: task.name,
						description: task.description,
						status: task.status,
						projectId: taskList.projectId,
						projectName: project.name,
					})
					.from(task)
					.innerJoin(taskList, eq(task.taskListId, taskList.id))
					.innerJoin(project, eq(taskList.projectId, project.id))
					.where(
						and(
							inArray(taskList.projectId, accessibleProjectIds),
							or(
								ilike(task.name, searchPattern),
								ilike(task.description, searchPattern),
							),
						),
					)
					.limit(input.limit);

				for (const t of taskResults) {
					if (
						matchesProjectFilter(t.projectId) &&
						matchesStatusFilter(t.status)
					) {
						results.push({
							id: `task-${t.id}`,
							title: t.name,
							description: t.description || "",
							type: "task",
							status: t.status,
							projectId: t.projectId,
							projectName: t.projectName,
						});
					}
				}
			}

			if (shouldSearchType("tasklist")) {
				const taskListResults = await ctx.db
					.select({
						id: taskList.id,
						name: taskList.name,
						description: taskList.description,
						status: taskList.status,
						projectId: taskList.projectId,
						projectName: project.name,
					})
					.from(taskList)
					.innerJoin(project, eq(taskList.projectId, project.id))
					.where(
						and(
							inArray(taskList.projectId, accessibleProjectIds),
							or(
								ilike(taskList.name, searchPattern),
								ilike(taskList.description, searchPattern),
							),
						),
					)
					.limit(input.limit);

				for (const tl of taskListResults) {
					if (
						matchesProjectFilter(tl.projectId) &&
						matchesStatusFilter(tl.status)
					) {
						results.push({
							id: `tasklist-${tl.id}`,
							title: tl.name,
							description: tl.description || "",
							type: "tasklist",
							status: tl.status,
							projectId: tl.projectId,
							projectName: tl.projectName,
						});
					}
				}
			}

			if (shouldSearchType("event")) {
				const eventResults = await ctx.db
					.select({
						id: calendarEvent.id,
						name: calendarEvent.name,
						description: calendarEvent.description,
						projectId: calendarEvent.projectId,
						projectName: project.name,
					})
					.from(calendarEvent)
					.innerJoin(project, eq(calendarEvent.projectId, project.id))
					.where(
						and(
							inArray(calendarEvent.projectId, accessibleProjectIds),
							or(
								ilike(calendarEvent.name, searchPattern),
								ilike(calendarEvent.description, searchPattern),
							),
						),
					)
					.limit(input.limit);

				for (const e of eventResults) {
					if (matchesProjectFilter(e.projectId)) {
						results.push({
							id: `event-${e.id}`,
							title: e.name,
							description: e.description || "",
							type: "event",
							status: "",
							projectId: e.projectId,
							projectName: e.projectName,
						});
					}
				}
			}

			if (shouldSearchType("post")) {
				const postResults = await ctx.db
					.select({
						id: post.id,
						title: post.title,
						content: post.content,
						projectId: post.projectId,
						projectName: project.name,
					})
					.from(post)
					.innerJoin(project, eq(post.projectId, project.id))
					.where(
						and(
							inArray(post.projectId, accessibleProjectIds),
							eq(post.isDraft, false),
							or(
								ilike(post.title, searchPattern),
								ilike(post.content, searchPattern),
							),
						),
					)
					.limit(input.limit);

				for (const p of postResults) {
					if (matchesProjectFilter(p.projectId)) {
						results.push({
							id: `post-${p.id}`,
							title: p.title,
							description: p.content || "",
							type: "post",
							status: "",
							projectId: p.projectId,
							projectName: p.projectName,
						});
					}
				}
			}

			const limitedResults = results.slice(0, input.limit);

			return limitedResults.map((row) => ({
				id: row.id,
				title: row.title,
				description: row.description,
				type: row.type,
				status: row.status,
				projectId: row.projectId,
				projectName: row.projectName,
				url: buildUrl(ctx.orgSlug, row),
				score: 1,
				createdAt: new Date(),
				dueDate: undefined,
			}));
		}),
});

function buildUrl(orgSlug: string, row: SearchResult): string {
	const projectId = row.projectId;
	const entityId = row.id.split("-")[1];

	switch (row.type) {
		case "project":
			return `/${orgSlug}/projects/${projectId}`;
		case "task":
			return `/${orgSlug}/projects/${projectId}/tasklists?task=${entityId}`;
		case "tasklist":
			return `/${orgSlug}/projects/${projectId}/tasklists/${entityId}`;
		case "event":
			return `/${orgSlug}/projects/${projectId}/events?event=${entityId}`;
		case "post":
			return `/${orgSlug}/projects/${projectId}/posts?post=${entityId}`;
		default:
			return `/${orgSlug}/projects/${projectId}`;
	}
}

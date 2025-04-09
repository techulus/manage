import { activity, comment, project, taskList } from "@/drizzle/schema";
import type { ProjectWithData } from "@/drizzle/types";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";

export const projectsRouter = createTRPCRouter({
	getProjectById: baseProcedure
		.input(
			z.object({
				id: z.number(),
				withTasksAndDocs: z.boolean().optional().default(false),
			}),
		)
		.query(async ({ ctx, input }) => {
			const data = await ctx.db.query.project
				.findFirst({
					where: and(eq(project.id, input.id)),
					with: input.withTasksAndDocs
						? {
								taskLists: {
									where: eq(taskList.status, "active"),
									with: {
										tasks: true,
									},
								},
							}
						: {},
				})
				.execute();

			if (!data) {
				throw new Error(`Project with id ${input.id} not found`);
			}

			return data as ProjectWithData;
		}),
	getComments: baseProcedure
		.input(
			z.object({
				parentId: z.number(),
				type: z.string(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const comments = await ctx.db.query.comment.findMany({
				where: and(
					eq(comment.parentId, input.parentId),
					eq(comment.type, input.type),
				),
				orderBy: desc(comment.createdAt),
				with: {
					creator: true,
				},
			});

			return comments;
		}),
	getActivities: baseProcedure
		.input(
			z.object({
				projectId: z.number(),
				offset: z.number().optional().default(0),
			}),
		)
		.query(async ({ ctx, input }) => {
			const activities = await ctx.db.query.activity
				.findMany({
					with: {
						actor: {
							columns: {
								id: true,
								firstName: true,
								imageUrl: true,
							},
						},
					},
					where: eq(activity.projectId, input.projectId),
					orderBy: [desc(activity.createdAt)],
					limit: 25,
					offset: input.offset,
				})
				.execute();

			return activities;
		}),
});

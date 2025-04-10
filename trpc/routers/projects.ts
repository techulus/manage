import { activity, comment, project } from "@/drizzle/schema";
import { generateObjectDiffMessage, logActivity } from "@/lib/activity";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

export const projectsRouter = createTRPCRouter({
	upsertProject: protectedProcedure
		.input(
			z.object({
				id: z.number().optional(),
				name: z.string(),
				description: z.string().optional(),
				dueDate: z.date().optional(),
				status: z.enum(["active", "archived"]).optional().default("active"),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (input.id) {
				const currentProject = await ctx.db.query.project
					.findFirst({
						where: eq(project.id, +input.id),
					})
					.execute();

				const updatedProject = await ctx.db
					.update(project)
					.set({
						name: input.name,
						description: input.description,
						dueDate: input.dueDate,
						status: input.status,
						updatedAt: new Date(),
					})
					.where(eq(project.id, input.id))
					.returning();

				if (currentProject) {
					await logActivity({
						action: "updated",
						type: "project",
						message: `Updated project ${input.name}, ${generateObjectDiffMessage(
							currentProject,
							updatedProject?.[0],
						)}`,
						projectId: +input.id,
					});
				}
			} else {
				const newProject = await ctx.db
					.insert(project)
					.values({
						name: input.name,
						description: input.description,
						dueDate: input.dueDate,
						status: input.status,
						createdByUser: ctx.userId,
					})
					.returning({ id: project.id })
					.execute();

				await logActivity({
					action: "created",
					type: "project",
					message: `Created project ${input.name}`,
					projectId: newProject?.[0].id,
				});
			}
		}),
	getProjectById: protectedProcedure
		.input(
			z.object({
				id: z.number(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const data = await ctx.db.query.project
				.findFirst({
					where: and(eq(project.id, input.id)),
				})
				.execute();

			if (!data) {
				throw new Error(`Project with id ${input.id} not found`);
			}

			return data;
		}),
	getComments: protectedProcedure
		.input(
			z.object({
				roomId: z.string(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const comments = await ctx.db.query.comment.findMany({
				where: eq(comment.roomId, input.roomId),
				orderBy: desc(comment.createdAt),
				with: {
					creator: true,
				},
			});

			return comments;
		}),
	addComment: protectedProcedure
		.input(
			z.object({
				projectId: z.number(),
				roomId: z.string(),
				content: z.string(),
				metadata: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.db.insert(comment).values({
				roomId: input.roomId,
				content: input.content,
				metadata: JSON.parse(input.metadata),
				createdByUser: ctx.userId,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
			await logActivity({
				action: "created",
				type: "comment",
				message: "Commented",
				projectId: input.projectId,
			});
		}),
	deleteComment: protectedProcedure
		.input(
			z.object({
				id: z.number(),
				projectId: z.number(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.db.delete(comment).where(eq(comment.id, input.id));
			await logActivity({
				action: "deleted",
				type: "comment",
				message: "Deleted comment",
				projectId: input.projectId,
			});
		}),
	getActivities: protectedProcedure
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

import { activity, comment, project } from "@/drizzle/schema";
import { logActivity } from "@/lib/activity";
import {
	deleteProjectSearchItems,
	deleteSearchItem,
	indexProject,
} from "@/lib/search/helpers";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

export const projectsRouter = createTRPCRouter({
	createProject: protectedProcedure
		.input(
			z.object({
				name: z.string(),
				description: z.string().optional(),
				dueDate: z.date().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const newProject = await ctx.db
				.insert(project)
				.values({
					name: input.name,
					description: input.description,
					dueDate: input.dueDate,
					status: "active",
					createdByUser: ctx.userId,
				})
				.returning()
				.execute();

			await logActivity({
				action: "created",
				type: "project",
				target: `/${ctx.orgSlug}/projects/${newProject?.[0].id}`,
				newValue: newProject?.[0],
				projectId: newProject?.[0].id,
			});

			// Index the project for search
			if (newProject?.[0]) {
				await indexProject(ctx.search, newProject[0]);
			}

			return newProject?.[0];
		}),
	updateProject: protectedProcedure
		.input(
			z
				.object({
					id: z.number(),
					name: z.string(),
				})
				.or(
					z.object({
						id: z.number(),
						description: z.string(),
					}),
				)
				.or(
					z.object({
						id: z.number(),
						dueDate: z.date().nullable(),
					}),
				)
				.or(
					z.object({
						id: z.number(),
						status: z.enum(["active", "archived"]),
					}),
				),
		)
		.mutation(async ({ ctx, input }) => {
			const currentProject = await ctx.db.query.project
				.findFirst({
					where: eq(project.id, +input.id),
				})
				.execute();

			const filteredInput = Object.fromEntries(
				Object.entries(input).filter(([key]) => key !== "id"),
			);

			const updatedProject = await ctx.db
				.update(project)
				.set(filteredInput)
				.where(eq(project.id, input.id))
				.returning();

			if (currentProject) {
				await logActivity({
					action: "updated",
					type: "project",
					oldValue: currentProject,
					newValue: updatedProject?.[0],
					target: `/${ctx.orgSlug}/projects/${input.id}`,
					projectId: +input.id,
				});

				// Re-index the updated project for search
				if (updatedProject?.[0]) {
					await indexProject(ctx.search, updatedProject[0]);
				}
			}

			return updatedProject?.[0];
		}),
	deleteProject: protectedProcedure
		.input(
			z.object({
				id: z.number(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const deletedProject = await ctx.db
				.delete(project)
				.where(eq(project.id, input.id))
				.returning();

			await logActivity({
				action: "deleted",
				type: "project",
				projectId: input.id,
				oldValue: deletedProject[0],
			});

			// Remove project from search index
			await deleteSearchItem(ctx.search, `project-${input.id}`, "project");

			// Also remove all related content from search (tasks, tasklists, events)
			await deleteProjectSearchItems(ctx.search, input.id);

			return deletedProject[0];
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

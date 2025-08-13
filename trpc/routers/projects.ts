import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import {
	activity,
	comment,
	project,
	projectPermission,
} from "@/drizzle/schema";
import { logActivity } from "@/lib/activity";
import {
	canEditProject,
	canViewProject,
	checkProjectPermission,
} from "@/lib/permissions";
import {
	deleteProjectSearchItems,
	deleteSearchItem,
	indexProject,
} from "@/lib/search/helpers";
import { sendMentionNotifications } from "@/lib/utils/mentionNotifications";
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
			// Check if user is in an organization and if they're an admin
			if (ctx.orgId && !ctx.isOrgAdmin) {
				throw new Error("Only organization admins can create projects");
			}

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

			// Grant editor permission to the project creator
			if (newProject?.[0]) {
				await ctx.db.insert(projectPermission).values({
					projectId: newProject[0].id,
					userId: ctx.userId,
					role: "editor",
					createdByUser: ctx.userId,
				});

				// Index the project for search
				await indexProject(ctx.search, newProject[0]);

				// Send mention notifications if description was provided
				if (input.description) {
					await sendMentionNotifications(input.description, {
						type: "project",
						entityName: input.name,
						entityId: newProject[0].id,
						orgSlug: ctx.orgSlug,
						fromUserId: ctx.userId,
					});
				}
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
			// Check if user has edit permission for this project
			const canEdit = await canEditProject(ctx, +input.id);
			if (!canEdit) {
				throw new Error("Project edit access denied");
			}

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

				// Send mention notifications if description was updated
				if ("description" in input && input.description && currentProject) {
					await sendMentionNotifications(input.description, {
						type: "project",
						entityName: currentProject.name,
						entityId: +input.id,
						orgSlug: ctx.orgSlug,
						fromUserId: ctx.userId,
					});
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
			// Check if user has edit permission for this project (needed to delete)
			const canEdit = await canEditProject(ctx, input.id);
			if (!canEdit) {
				throw new Error("Project delete access denied");
			}

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
			// Check if user has permission to view this project
			const hasAccess = await canViewProject(ctx, input.id);
			if (!hasAccess) {
				throw new Error("Project access denied");
			}

			const data = await ctx.db.query.project
				.findFirst({
					where: and(eq(project.id, input.id)),
				})
				.execute();

			if (!data) {
				throw new Error(`Project with id ${input.id} not found`);
			}

			// Get the user's permission for this project
			const userRole = await checkProjectPermission(
				ctx.db,
				input.id,
				ctx.userId,
			);
			const canEdit = await canEditProject(ctx, input.id);

			return {
				...data,
				userRole,
				canEdit,
			};
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
				content: z.string().min(1, "Comment content cannot be empty"),
				metadata: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const canEdit = await canEditProject(ctx, input.projectId);
			if (!canEdit) {
				throw new Error(
					"You don't have permission to add comments to this project",
				);
			}

			const [newComment] = await ctx.db
				.insert(comment)
				.values({
					roomId: input.roomId,
					content: input.content,
					metadata: JSON.parse(input.metadata),
					createdByUser: ctx.userId,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			const projectData = await ctx.db.query.project.findFirst({
				where: eq(project.id, input.projectId),
			});

			if (projectData) {
				await sendMentionNotifications(input.content, {
					type: "comment",
					entityName: projectData.name,
					entityId: input.projectId,
					projectId: input.projectId,
					orgSlug: ctx.orgSlug,
					fromUserId: ctx.userId,
				});
			}

			await logActivity({
				action: "created",
				type: "comment",
				projectId: input.projectId,
			});

			return newComment;
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

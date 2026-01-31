import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import {
	activity,
	comment,
	post,
	project,
	projectPermission,
	task,
	taskList,
} from "@/drizzle/schema";
import { logActivity } from "@/lib/activity";
import {
	cleanupContentBlobs,
	cleanupRemovedBlobs,
} from "@/lib/blobStore/cleanup";
import {
	canEditProject,
	canViewProject,
	checkProjectPermission,
} from "@/lib/permissions";
import { sendMentionNotifications } from "@/lib/utils/mentionNotifications";
import { createTRPCRouter, protectedProcedure } from "../init";

export const projectsRouter = createTRPCRouter({
	createProject: protectedProcedure
		.input(
			z.object({
				name: z.string(),
				description: z.string().optional(),
				metadata: z.any().optional(),
				dueDate: z.date().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (ctx.orgId && !ctx.isOrgAdmin) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only organization admins can create projects",
				});
			}

			const newProject = await ctx.db
				.insert(project)
				.values({
					name: input.name,
					description: input.description,
					metadata: input.metadata,
					dueDate: input.dueDate,
					status: "active",
					createdByUser: ctx.userId,
					organizationId: ctx.orgId,
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

			if (newProject?.[0]) {
				await ctx.db.insert(projectPermission).values({
					projectId: newProject[0].id,
					userId: ctx.userId,
					role: "editor",
					createdByUser: ctx.userId,
				});

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
						metadata: z.any().optional(),
					}),
				)
				.or(
					z.object({
						id: z.number(),
						status: z.enum(["active", "archived"]),
					}),
				)
				.or(
					z.object({
						id: z.number(),
						dueDate: z.date().nullable(),
					}),
				),
		)
		.mutation(async ({ ctx, input }) => {
			const canEdit = await canEditProject(ctx, +input.id);
			if (!canEdit) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Project edit access denied",
				});
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

				if ("description" in input && currentProject) {
					await cleanupRemovedBlobs(
						ctx.db,
						currentProject.description,
						input.description,
					);

					if (input.description) {
						await sendMentionNotifications(input.description, {
							type: "project",
							entityName: currentProject.name,
							entityId: +input.id,
							orgSlug: ctx.orgSlug,
							fromUserId: ctx.userId,
						});
					}
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
			const canEdit = await canEditProject(ctx, input.id);
			if (!canEdit) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Project delete access denied",
				});
			}

			const projectToDelete = await ctx.db.query.project.findFirst({
				where: eq(project.id, input.id),
			});

			const projectPosts = await ctx.db.query.post.findMany({
				where: eq(post.projectId, input.id),
				columns: { content: true },
			});

			const projectTaskLists = await ctx.db.query.taskList.findMany({
				where: eq(taskList.projectId, input.id),
				columns: { id: true, description: true },
			});

			const taskListIds = projectTaskLists.map((tl) => tl.id);
			const projectTasks =
				taskListIds.length > 0
					? await ctx.db.query.task.findMany({
							where: inArray(task.taskListId, taskListIds),
							columns: { description: true },
						})
					: [];

			const projectComments = await ctx.db.query.comment.findMany({
				where: eq(comment.roomId, `project-${input.id}`),
				columns: { content: true },
			});

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

			const cleanupPromises: Promise<number>[] = [];

			if (projectToDelete?.description) {
				cleanupPromises.push(
					cleanupContentBlobs(ctx.db, projectToDelete.description),
				);
			}

			for (const p of projectPosts) {
				if (p.content) {
					cleanupPromises.push(cleanupContentBlobs(ctx.db, p.content));
				}
			}

			for (const tl of projectTaskLists) {
				if (tl.description) {
					cleanupPromises.push(cleanupContentBlobs(ctx.db, tl.description));
				}
			}

			for (const t of projectTasks) {
				if (t.description) {
					cleanupPromises.push(cleanupContentBlobs(ctx.db, t.description));
				}
			}

			for (const c of projectComments) {
				if (c.content) {
					cleanupPromises.push(cleanupContentBlobs(ctx.db, c.content));
				}
			}

			await Promise.all(cleanupPromises);

			return deletedProject[0];
		}),
	getProjectById: protectedProcedure
		.input(
			z.object({
				id: z.number(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const hasAccess = await canViewProject(ctx, input.id);
			if (!hasAccess) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Project access denied",
				});
			}

			const data = await ctx.db.query.project
				.findFirst({
					where: and(eq(project.id, input.id)),
				})
				.execute();

			if (!data) {
				throw new Error(`Project with id ${input.id} not found`);
			}

			const userRole = await checkProjectPermission(
				ctx.db,
				input.id,
				ctx.userId,
			);

			const canEdit =
				ctx.isOrgAdmin ||
				userRole === "editor" ||
				data.createdByUser === ctx.userId;

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
				projectId: z.number(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const hasAccess = await canViewProject(ctx, input.projectId);
			if (!hasAccess) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Project access denied",
				});
			}

			const comments = await ctx.db.query.comment.findMany({
				where: eq(comment.roomId, input.roomId),
				orderBy: desc(comment.createdAt),
				with: {
					creator: true,
				},
			});

			const replyRoomIds = comments.map((c) => `comment-${c.id}`);

			const counts = replyRoomIds.length
				? await ctx.db
						.select({ roomId: comment.roomId, cnt: count() })
						.from(comment)
						.where(inArray(comment.roomId, replyRoomIds))
						.groupBy(comment.roomId)
				: [];

			const countByRoomId = new Map(
				counts.map((r) => [r.roomId, Number(r.cnt)]),
			);

			return comments.map((commentItem) => ({
				...commentItem,
				replyCount: countByRoomId.get(`comment-${commentItem.id}`) ?? 0,
				replies: [],
			}));
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
			const canEdit = await canEditProject(ctx, input.projectId);
			if (!canEdit) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Project edit access denied",
				});
			}

			const existingComment = await ctx.db.query.comment.findFirst({
				where: eq(comment.id, input.id),
			});

			await ctx.db.delete(comment).where(eq(comment.id, input.id));

			await logActivity({
				action: "deleted",
				type: "comment",
				projectId: input.projectId,
			});

			if (existingComment?.content) {
				await cleanupContentBlobs(ctx.db, existingComment.content);
			}
		}),
	getActivities: protectedProcedure
		.input(
			z.object({
				projectId: z.number(),
				offset: z.number().optional().default(0),
			}),
		)
		.query(async ({ ctx, input }) => {
			const hasAccess = await canViewProject(ctx, input.projectId);
			if (!hasAccess) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Project access denied",
				});
			}

			const activities = await ctx.db.query.activity
				.findMany({
					with: {
						actor: {
							columns: {
								id: true,
								firstName: true,
								image: true,
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

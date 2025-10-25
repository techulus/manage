import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { post } from "@/drizzle/schema";
import { logActivity } from "@/lib/activity";
import { canEditProject, canViewProject } from "@/lib/permissions";
import {
	deleteSearchItem,
	indexPostWithProjectFetch,
} from "@/lib/search/helpers";
import { sendMentionNotifications } from "@/lib/utils/mentionNotifications";
import { createTRPCRouter, protectedProcedure } from "../init";

export const postsRouter = createTRPCRouter({
	list: protectedProcedure
		.input(
			z.object({
				projectId: z.number(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { projectId } = input;

			const hasAccess = await canViewProject(ctx, projectId);
			if (!hasAccess) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Project access denied",
				});
			}

			const posts = await ctx.db.query.post.findMany({
				where: and(
					eq(post.projectId, projectId),
					eq(post.isDraft, false),
				),
				orderBy: [desc(post.publishedAt)],
				with: {
					creator: {
						columns: {
							id: true,
							firstName: true,
							lastName: true,
							imageUrl: true,
						},
					},
				},
			});

			return posts;
		}),
	listAll: protectedProcedure
		.input(
			z.object({
				projectId: z.number(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { projectId } = input;

			const canEdit = await canEditProject(ctx, projectId);
			if (!canEdit) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Project edit access denied",
				});
			}

			const posts = await ctx.db.query.post.findMany({
				where: eq(post.projectId, projectId),
				orderBy: [desc(post.updatedAt)],
				with: {
					creator: {
						columns: {
							id: true,
							firstName: true,
							lastName: true,
							imageUrl: true,
						},
					},
				},
			});

			return posts;
		}),
	myDrafts: protectedProcedure
		.input(
			z.object({
				projectId: z.number(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { projectId } = input;

			const hasAccess = await canViewProject(ctx, projectId);
			if (!hasAccess) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Project access denied",
				});
			}

			const drafts = await ctx.db.query.post.findMany({
				where: and(
					eq(post.projectId, projectId),
					eq(post.isDraft, true),
					eq(post.createdByUser, ctx.userId),
				),
				orderBy: [desc(post.updatedAt)],
				with: {
					creator: {
						columns: {
							id: true,
							firstName: true,
							lastName: true,
							imageUrl: true,
						},
					},
				},
			});

			return drafts;
		}),
	get: protectedProcedure
		.input(
			z.object({
				id: z.number(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { id } = input;

			const postData = await ctx.db.query.post.findFirst({
				where: eq(post.id, id),
				with: {
					creator: {
						columns: {
							id: true,
							firstName: true,
							lastName: true,
							imageUrl: true,
						},
					},
					project: true,
				},
			});

			if (!postData) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Post not found",
				});
			}

			const hasAccess = await canViewProject(ctx, postData.projectId);
			if (!hasAccess) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Project access denied",
				});
			}

			if (postData.isDraft && postData.createdByUser !== ctx.userId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Draft posts are only visible to their authors",
				});
			}

			return postData;
		}),
	delete: protectedProcedure
		.input(
			z.object({
				id: z.number(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id } = input;

			const existingPost = await ctx.db.query.post.findFirst({
				where: eq(post.id, id),
			});

			if (!existingPost) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Post not found",
				});
			}

			const canEdit = await canEditProject(ctx, existingPost.projectId);
			if (!canEdit) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Project edit access denied",
				});
			}

			const deletedPost = await ctx.db
				.delete(post)
				.where(eq(post.id, id))
				.returning();

			if (deletedPost.length) {
				const { metadata: _, ...oldValue } = deletedPost[0];

				await logActivity({
					action: "deleted",
					type: "post",
					projectId: deletedPost[0].projectId,
					oldValue,
				});

				await deleteSearchItem(ctx.search, `post-${id}`, "post");
			}

			return deletedPost[0];
		}),
	upsert: protectedProcedure
		.input(
			z.object({
				id: z.number().optional(),
				projectId: z.number(),
				title: z
					.string()
					.min(1, { message: "Title must be at least 1 character" }),
				content: z.string().optional(),
				metadata: z.any().optional(),
				category: z.enum(["announcement", "fyi", "question"]),
				isDraft: z.boolean().default(true),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, projectId, title, content, metadata, category, isDraft } = input;

			if (id) {
				const existing = await ctx.db.query.post.findFirst({
					where: eq(post.id, id),
				});
				if (!existing) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Post not found",
					});
				}
				const canEditSource = await canEditProject(ctx, existing.projectId);
				const canEditTarget =
					existing.projectId !== projectId
						? await canEditProject(ctx, projectId)
						: true;
				if (!canEditSource || !canEditTarget) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Project edit access denied",
					});
				}
			} else {
				const canEditTarget = await canEditProject(ctx, projectId);
				if (!canEditTarget) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Project edit access denied",
					});
				}
			}

			const postData = {
				title,
				content,
				metadata,
				category,
				isDraft,
				projectId,
				publishedAt: isDraft ? null : new Date(),
			};

			let postId: number;

			if (id) {
				postId = id;
				const oldPost = await ctx.db.query.post.findFirst({
					where: eq(post.id, id),
				});

				const updatedPost = await ctx.db
					.update(post)
					.set(postData)
					.where(eq(post.id, id))
					.returning();

				const { metadata: oldMeta, ...oldValue } = oldPost || {};
				const { metadata: newMeta, ...newValue } = updatedPost[0] || {};

				await logActivity({
					action: "updated",
					type: "post",
					projectId,
					oldValue,
					newValue,
				});

				if (updatedPost?.[0] && !isDraft) {
					await indexPostWithProjectFetch(ctx.db, ctx.search, updatedPost[0]);

					if (content) {
						await sendMentionNotifications(content, {
							type: "post",
							entityName: title,
							entityId: id,
							projectId,
							orgSlug: ctx.orgSlug,
							fromUserId: ctx.userId,
						});
					}
				}
			} else {
				const newPost = await ctx.db
					.insert(post)
					.values({
						...postData,
						createdByUser: ctx.userId,
					})
					.returning()
					.execute();

				postId = newPost[0].id;

				const { metadata: _, ...newValue } = newPost[0];

				await logActivity({
					action: "created",
					type: "post",
					projectId,
					newValue,
				});

				if (newPost?.[0] && !isDraft) {
					await indexPostWithProjectFetch(ctx.db, ctx.search, newPost[0]);

					if (content) {
						await sendMentionNotifications(content, {
							type: "post",
							entityName: title,
							entityId: postId,
							projectId,
							orgSlug: ctx.orgSlug,
							fromUserId: ctx.userId,
						});
					}
				}
			}

			return { id: postId, ...postData };
		}),
});

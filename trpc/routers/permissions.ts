import { TRPCError } from "@trpc/server";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { member, project, projectPermission, user } from "@/drizzle/schema";
import { logActivity } from "@/lib/activity";
import { createTRPCRouter, protectedProcedure } from "../init";

export const permissionsRouter = createTRPCRouter({
	getProjectPermissions: protectedProcedure
		.input(
			z.object({
				projectId: z.number(),
			}),
		)
		.query(async ({ ctx, input }) => {
			if (!ctx.isOrgAdmin) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only organization admins can view project permissions",
				});
			}

			const proj = await ctx.db.query.project.findFirst({
				where: eq(project.id, input.projectId),
				columns: { organizationId: true },
			});

			if (!proj || proj.organizationId !== ctx.orgId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Project not found or access denied",
				});
			}

			const permissions = await ctx.db.query.projectPermission.findMany({
				where: eq(projectPermission.projectId, input.projectId),
				with: {
					user: {
						columns: {
							id: true,
							email: true,
							firstName: true,
							lastName: true,
							image: true,
						},
					},
				},
			});

			return permissions;
		}),

	grantPermission: protectedProcedure
		.input(
			z.object({
				projectId: z.number(),
				userId: z.string(),
				role: z.enum(["editor", "reader"]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.isOrgAdmin) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only organization admins can grant project permissions",
				});
			}

			const proj = await ctx.db.query.project.findFirst({
				where: eq(project.id, input.projectId),
				columns: { organizationId: true },
			});

			if (!proj || proj.organizationId !== ctx.orgId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Project not found or access denied",
				});
			}

			const existingPermission = await ctx.db.query.projectPermission.findFirst(
				{
					where: and(
						eq(projectPermission.projectId, input.projectId),
						eq(projectPermission.userId, input.userId),
					),
				},
			);

			if (existingPermission) {
				// Update existing permission
				await ctx.db
					.update(projectPermission)
					.set({
						role: input.role,
						updatedAt: new Date(),
					})
					.where(
						and(
							eq(projectPermission.projectId, input.projectId),
							eq(projectPermission.userId, input.userId),
						),
					);

				await logActivity({
					action: "updated",
					type: "project",
					projectId: input.projectId,
					newValue: { userId: input.userId, role: input.role },
				});
			} else {
				// Create new permission
				await ctx.db.insert(projectPermission).values({
					projectId: input.projectId,
					userId: input.userId,
					role: input.role,
					createdByUser: ctx.userId,
				});

				await logActivity({
					action: "created",
					type: "project",
					projectId: input.projectId,
					newValue: { userId: input.userId, role: input.role },
				});
			}

			return { success: true };
		}),

	revokePermission: protectedProcedure
		.input(
			z.object({
				projectId: z.number(),
				userId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.isOrgAdmin) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only organization admins can revoke project permissions",
				});
			}

			const proj = await ctx.db.query.project.findFirst({
				where: eq(project.id, input.projectId),
				columns: { organizationId: true },
			});

			if (!proj || proj.organizationId !== ctx.orgId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Project not found or access denied",
				});
			}

			await ctx.db
				.delete(projectPermission)
				.where(
					and(
						eq(projectPermission.projectId, input.projectId),
						eq(projectPermission.userId, input.userId),
					),
				);

			await logActivity({
				action: "deleted",
				type: "project",
				projectId: input.projectId,
				oldValue: { userId: input.userId },
			});

			return { success: true };
		}),

	getOrganizationMembers: protectedProcedure.query(async ({ ctx }) => {
		if (!ctx.orgId) {
			return [];
		}

		const members = await ctx.db.query.member.findMany({
			where: eq(member.organizationId, ctx.orgId),
			with: {
				user: {
					columns: {
						id: true,
						email: true,
						name: true,
						firstName: true,
						lastName: true,
						image: true,
					},
				},
			},
		});

		return members;
	}),

	getOrganizationUsers: protectedProcedure.query(async ({ ctx }) => {
		if (!ctx.isOrgAdmin) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Only organization admins can view organization users",
			});
		}

		if (!ctx.orgId) {
			return [];
		}

		const orgMembers = await ctx.db.query.member.findMany({
			where: eq(member.organizationId, ctx.orgId),
			columns: { userId: true },
		});

		const memberUserIds = orgMembers.map((m) => m.userId);
		if (memberUserIds.length === 0) {
			return [];
		}

		const orgUsers = await ctx.db.query.user.findMany({
			where: inArray(user.id, memberUserIds),
			columns: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				image: true,
			},
		});

		return orgUsers.filter((u) => u.id !== ctx.userId);
	}),
});

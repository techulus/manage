import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { projectPermission } from "@/drizzle/schema";
import { logActivity } from "@/lib/activity";
import { createTRPCRouter, protectedProcedure } from "../init";

export const permissionsRouter = createTRPCRouter({
	// Get all permissions for a project
	getProjectPermissions: protectedProcedure
		.input(
			z.object({
				projectId: z.number(),
			}),
		)
		.query(async ({ ctx, input }) => {
			// Check if user is org admin
			if (!ctx.isOrgAdmin) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only organization admins can view project permissions",
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

	// Grant permission to a user
	grantPermission: protectedProcedure
		.input(
			z.object({
				projectId: z.number(),
				userId: z.string(),
				role: z.enum(["editor", "reader"]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Check if user is org admin
			if (!ctx.isOrgAdmin) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only organization admins can grant project permissions",
				});
			}

			// Check if permission already exists
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

	// Revoke permission from a user
	revokePermission: protectedProcedure
		.input(
			z.object({
				projectId: z.number(),
				userId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Check if user is org admin
			if (!ctx.isOrgAdmin) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only organization admins can revoke project permissions",
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

	// Get all users in the organization (for permission management UI)
	getOrganizationUsers: protectedProcedure.query(async ({ ctx }) => {
		// Check if user is org admin
		if (!ctx.isOrgAdmin) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Only organization admins can view organization users",
			});
		}

		// Get all users in the organization
		const allUsers = await ctx.db.query.user.findMany({
			columns: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				image: true,
			},
		});

		// Filter out the current admin user since they already have access to all projects
		const nonAdminUsers = allUsers.filter((user) => user.id !== ctx.userId);

		return nonAdminUsers;
	}),
});

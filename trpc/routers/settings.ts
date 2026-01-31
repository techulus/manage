import { eq, inArray, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { z } from "zod";
import { blob, member, user } from "@/drizzle/schema";
import type { User } from "@/drizzle/types";
import { getOwner } from "@/lib/utils/useOwner";
import { createTRPCRouter, protectedProcedure } from "../init";

export const settingsRouter = createTRPCRouter({
	getStorageUsage: protectedProcedure.query(async ({ ctx }) => {
		const { ownerId } = await getOwner();

		const details = await ctx.db
			.select({
				count: sql<number>`count(*)`,
				usage: sql<number>`sum(${blob.contentSize})`,
			})
			.from(blob)
			.where(sql`${blob.key} LIKE ${`${ownerId}/%`}`)
			.execute();

		return {
			usage: details?.[0].usage ?? 0,
			count: details?.[0].count ?? 0,
		};
	}),
	saveTimezone: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			const cookieStore = await cookies();
			cookieStore.set("userTimezone", input, {
				path: "/",
				sameSite: "strict",
				maxAge: 60 * 60 * 24 * 365,
			});

			await ctx.db
				.update(user)
				.set({ timeZone: input, lastActiveAt: new Date() })
				.where(eq(user.id, ctx.userId))
				.execute();
		}),
	getTimezone: protectedProcedure.output(z.string()).query(async () => {
		const cookieStore = await cookies();
		return (
			cookieStore.get("userTimezone")?.value ??
			Intl.DateTimeFormat().resolvedOptions().timeZone
		);
	}),
	getAllUsers: protectedProcedure
		.input(z.boolean().optional().default(false))
		.query(async ({ ctx, input }) => {
			if (!ctx.orgId) {
				const currentUser = await ctx.db.query.user.findFirst({
					where: eq(user.id, ctx.userId),
				});
				return currentUser ? [currentUser] : [];
			}

			const orgMembers = await ctx.db.query.member.findMany({
				where: eq(member.organizationId, ctx.orgId),
				columns: { userId: true },
			});

			const memberUserIds = orgMembers.map((m) => m.userId);
			if (memberUserIds.length === 0) {
				return [];
			}

			const users: User[] =
				(await ctx.db.query.user.findMany({
					where: inArray(user.id, memberUserIds),
				})) ?? [];

			return input ? users : users.filter((u) => u.id !== ctx.userId);
		}),
});

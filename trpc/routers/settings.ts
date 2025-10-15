import { eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { z } from "zod";
import { blob, user } from "@/drizzle/schema";
import type { User } from "@/drizzle/types";
import { opsUser } from "@/ops/drizzle/schema";
import { getOpsDatabase } from "@/ops/useOps";
import { createTRPCRouter, protectedProcedure } from "../init";

export const settingsRouter = createTRPCRouter({
	getStorageUsage: protectedProcedure.query(async ({ ctx }) => {
		const details = await ctx.db
			.select({
				count: sql<number>`count(*)`,
				usage: sql<number>`sum(${blob.contentSize})`,
			})
			.from(blob)
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

			// Update main user database
			await ctx.db
				.update(user)
				.set({ timeZone: input, lastActiveAt: new Date() })
				.where(eq(user.id, ctx.userId))
				.execute();

			// Also update ops user database for email scheduling
			try {
				const opsDb = await getOpsDatabase();
				await opsDb
					.update(opsUser)
					.set({ timeZone: input, lastActiveAt: new Date() })
					.where(eq(opsUser.id, ctx.userId))
					.execute();
			} catch (error) {
				console.error(
					"[Settings] Error updating timezone in ops database:",
					error,
				);
				// Don't throw error to avoid blocking the main update
			}
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
			const users: User[] = (await ctx.db.query.user.findMany()) ?? [];
			return input ? users : users.filter((user) => user.id !== ctx.userId);
		}),
});

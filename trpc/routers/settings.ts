import { blob } from "@/drizzle/schema";
import { sql } from "drizzle-orm";
import { cookies } from "next/headers";
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
	getTimezone: protectedProcedure.query(async () => {
		const cookieStore = await cookies();
		return (
			cookieStore.get("userTimezone")?.value ??
			Intl.DateTimeFormat().resolvedOptions().timeZone
		);
	}),
});

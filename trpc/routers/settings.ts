import { blob } from "@/drizzle/schema";
import { sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { baseProcedure, createTRPCRouter } from "../init";

export const settingsRouter = createTRPCRouter({
	getStorageUsage: baseProcedure.query(async ({ ctx }) => {
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
	getTimezone: baseProcedure.query(async () => {
		const cookieStore = await cookies();
		return (
			cookieStore.get("userTimezone")?.value ??
			Intl.DateTimeFormat().resolvedOptions().timeZone
		);
	}),
});

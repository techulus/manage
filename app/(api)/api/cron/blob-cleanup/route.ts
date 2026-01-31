import { and, eq, lt } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { blob } from "@/drizzle/schema";
import { deleteFile } from "@/lib/blobStore";
import { database } from "@/lib/utils/useDatabase";

export async function GET(request: NextRequest) {
	const authHeader = request.headers.get("authorization");
	if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const db = database();
	const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

	const stalePending = await db
		.select()
		.from(blob)
		.where(and(eq(blob.status, "pending"), lt(blob.createdAt, oneHourAgo)));

	const results = await Promise.allSettled(
		stalePending.map(async (b) => {
			await deleteFile(b.key);
			await db.delete(blob).where(eq(blob.id, b.id));
			return b.id;
		}),
	);

	const deletedCount = results.filter((r) => r.status === "fulfilled").length;
	const errors = results
		.filter((r): r is PromiseRejectedResult => r.status === "rejected")
		.map((r, i) => `Failed to delete blob ${stalePending[i].id}: ${r.reason}`);

	return NextResponse.json({
		found: stalePending.length,
		deleted: deletedCount,
		errors: errors.length > 0 ? errors : undefined,
	});
}

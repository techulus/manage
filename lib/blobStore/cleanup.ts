import { eq } from "drizzle-orm";
import { blob } from "@/drizzle/schema";
import type { Database } from "@/drizzle/types";
import { deleteFile } from "./index";

const BLOB_URL_REGEX = /\/api\/blob\/([a-f0-9-]{36})\//g;

export function extractBlobIds(
	content: string | null | undefined,
): Set<string> {
	if (!content) return new Set();
	const ids = new Set<string>();
	const regex = new RegExp(BLOB_URL_REGEX);
	for (
		let match = regex.exec(content);
		match !== null;
		match = regex.exec(content)
	) {
		ids.add(match[1]);
	}
	return ids;
}

export async function cleanupRemovedBlobs(
	db: Database,
	oldContent: string | null | undefined,
	newContent: string | null | undefined,
): Promise<number> {
	const oldIds = extractBlobIds(oldContent);
	const newIds = extractBlobIds(newContent);

	const removedIds = [...oldIds].filter((id) => !newIds.has(id));

	for (const id of removedIds) {
		const [blobRecord] = await db
			.select()
			.from(blob)
			.where(eq(blob.id, id))
			.limit(1);
		if (blobRecord) {
			await deleteFile(blobRecord.key);
			await db.delete(blob).where(eq(blob.id, id));
		}
	}

	return removedIds.length;
}

export async function cleanupContentBlobs(
	db: Database,
	content: string | null | undefined,
): Promise<number> {
	const ids = extractBlobIds(content);

	for (const id of [...ids]) {
		const [blobRecord] = await db
			.select()
			.from(blob)
			.where(eq(blob.id, id))
			.limit(1);
		if (blobRecord) {
			await deleteFile(blobRecord.key);
			await db.delete(blob).where(eq(blob.id, id));
		}
	}

	return ids.size;
}

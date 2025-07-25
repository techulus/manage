import { blob } from "@/drizzle/schema";
import { deleteFile, listFiles } from "@/lib/blobStore";
import { getDatabaseForOwner } from "@/lib/utils/useDatabase";
import { triggerWorkflow } from "@/lib/utils/workflow";
import { serve } from "@upstash/workflow/nextjs";
import { inArray } from "drizzle-orm";

type WorkflowPayload = {
	ownerId: string;
};

const BATCH_SIZE = 25;

export const { POST } = serve<WorkflowPayload>(async (context) => {
	const { ownerId } = context.requestPayload;

	console.log(
		`[BlobDeletion] Starting blob deletion job for owner: ${ownerId}`,
	);

	// List blobs from S3 storage using the ownerId prefix
	const s3Objects = await context.run("list-blobs-from-storage", async () => {
		try {
			const objects = await listFiles(`${ownerId}/`, BATCH_SIZE);
			console.log(
				`[BlobDeletion] Found ${objects.length} blobs in S3 for owner: ${ownerId}`,
			);
			return objects;
		} catch (error) {
			console.error(
				`[BlobDeletion] Error listing blobs from S3 for owner: ${ownerId}:`,
				error,
			);
			return [];
		}
	});

	if (s3Objects.length === 0) {
		console.log(`[BlobDeletion] No blobs to delete for owner: ${ownerId}`);
		return { deleted: 0, hasMore: false };
	}

	// Delete blobs from S3 storage
	const deletedKeys = await context.run(
		"delete-blobs-from-storage",
		async () => {
			console.log(
				`[BlobDeletion] Deleting ${s3Objects.length} blobs from S3 storage for owner: ${ownerId}`,
			);

			const deletionResults = await Promise.allSettled(
				s3Objects.map(async (obj) => {
					const key = obj.Key!;
					try {
						await deleteFile(key);
						console.log(
							`[BlobDeletion] Successfully deleted blob ${key} from storage`,
						);
						return { success: true, key };
					} catch (error) {
						console.error(
							`[BlobDeletion] Failed to delete blob ${key} from storage:`,
							error,
						);
						return { success: false, key, error };
					}
				}),
			);

			const successfulKeys = deletionResults
				.filter(
					(result) => result.status === "fulfilled" && result.value.success,
				)
				.map((result) =>
					result.status === "fulfilled" ? result.value.key : "",
				)
				.filter(Boolean);

			const failed = deletionResults.length - successfulKeys.length;

			console.log(
				`[BlobDeletion] Storage deletion results for owner: ${ownerId} - Success: ${successfulKeys.length}, Failed: ${failed}`,
			);

			if (failed > 0) {
				const failedKeys = deletionResults
					.filter(
						(result) => result.status === "fulfilled" && !result.value.success,
					)
					.map((result) =>
						result.status === "fulfilled" ? result.value.key : "unknown",
					);
				console.error(
					"[BlobDeletion] Failed to delete blobs from storage:",
					failedKeys,
				);
			}

			return successfulKeys;
		},
	);

	// Clean up database entries for successfully deleted blobs
	await context.run("cleanup-database", async () => {
		if (deletedKeys.length === 0) {
			console.log(
				`[BlobDeletion] No successful deletions to clean up from database for owner: ${ownerId}`,
			);
			return;
		}

		try {
			const db = await getDatabaseForOwner(ownerId);
			const result = await db
				.delete(blob)
				.where(inArray(blob.key, deletedKeys))
				.execute();

			console.log(
				`[BlobDeletion] Cleaned up ${result.rowCount || 0} blob records from database for owner: ${ownerId}`,
			);
		} catch (error) {
			console.error(
				`[BlobDeletion] Error cleaning up database for owner: ${ownerId}:`,
				error,
			);
		}
	});

	const hasMore = s3Objects.length === BATCH_SIZE;
	console.log(
		`[BlobDeletion] Blob deletion batch completed for owner: ${ownerId} - Deleted: ${deletedKeys.length}, HasMore: ${hasMore}`,
	);

	// Trigger next batch if more blobs exist
	if (hasMore) {
		await context.run("trigger-next-batch", async () => {
			const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/jobs/blobs/delete-owner-blobs`;
			await triggerWorkflow(
				url,
				{ ownerId },
				"[BlobDeletion]",
			);
			console.log(`[BlobDeletion] Next batch triggered for owner: ${ownerId}`);
		});
	}

	return { deleted: deletedKeys.length, hasMore };
});

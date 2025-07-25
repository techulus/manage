import { Client } from "@upstash/workflow";

let workflowClient: Client | null = null;

/**
 * Get or create a singleton workflow client instance
 */
export function getWorkflowClient(): Client {
	if (!workflowClient) {
		if (!process.env.QSTASH_TOKEN) {
			throw new Error("QSTASH_TOKEN is not configured");
		}
		workflowClient = new Client({ token: process.env.QSTASH_TOKEN });
	}
	return workflowClient;
}

/**
 * Trigger a workflow with the given URL and body
 */
export async function triggerWorkflow<T = unknown>(
	url: string,
	body: T,
	logPrefix?: string,
): Promise<void> {
	const client = getWorkflowClient();
	const prefix = logPrefix || "[Workflow]";

	try {
		await client.trigger({
			url,
			body,
		});
		console.log(`${prefix} Workflow triggered successfully: ${url}`);
	} catch (error) {
		console.error(`${prefix} Error triggering workflow ${url}:`, error);
		throw error;
	}
}

/**
 * Trigger the blob deletion workflow for a given owner
 */
export async function triggerBlobDeletionWorkflow(ownerId: string): Promise<void> {
	const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/jobs/blobs/delete-owner-blobs`;
	await triggerWorkflow(
		url,
		{ ownerId },
		"[BlobDeletion]",
	);
	console.log(`[BlobDeletion] Initial workflow triggered for owner ${ownerId}`);
}
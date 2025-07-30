import { eq } from "drizzle-orm";
import { user } from "@/drizzle/schema";
import { extractMentionsFromHTML } from "./extractMentions";
import { database } from "./useDatabase";
import { notifyUser } from "./useNotification";

interface MentionContext {
	type: "project" | "task" | "tasklist" | "event" | "comment";
	entityName: string;
	entityId: number;
	projectId?: number; // For linking back to project
	orgSlug: string;
	fromUserId: string;
}

/**
 * Sends mention notifications for all users mentioned in editor content
 */
export async function sendMentionNotifications(
	htmlContent: string,
	context: MentionContext,
): Promise<void> {
	const mentionedUserIds = extractMentionsFromHTML(htmlContent);
	if (mentionedUserIds.length === 0) {
		return;
	}

	const db = await database();

	// Get current user details
	const currentUser = await db.query.user.findFirst({
		where: eq(user.id, context.fromUserId),
	});

	const fromUserName =
		currentUser?.firstName || currentUser?.email || "Someone";

	// Generate appropriate message and target based on context
	let message: string;
	let target: string;

	switch (context.type) {
		case "project":
			message = `${fromUserName} mentioned you in project "${context.entityName}"`;
			target = `/${context.orgSlug}/projects/${context.entityId}`;
			break;

		case "task":
			message = `${fromUserName} mentioned you in task "${context.entityName}"`;
			target = `/${context.orgSlug}/projects/${context.projectId}`;
			break;

		case "tasklist":
			message = `${fromUserName} mentioned you in task list "${context.entityName}"`;
			target = `/${context.orgSlug}/projects/${context.projectId}/tasklists/${context.entityId}`;
			break;

		case "event":
			message = `${fromUserName} mentioned you in event "${context.entityName}"`;
			target = `/${context.orgSlug}/projects/${context.projectId}/events`;
			break;

		case "comment":
			message = `${fromUserName} mentioned you in a comment on "${context.entityName}"`;
			target = `/${context.orgSlug}/projects/${context.projectId}`;
			break;

		default:
			message = `${fromUserName} mentioned you`;
			target = `/${context.orgSlug}`;
	}

	for (const userId of mentionedUserIds) {
		if (userId !== context.fromUserId) {
			await notifyUser(userId, message, {
				type: "mention",
				target,
				fromUser: context.fromUserId,
			});
		}
	}
}

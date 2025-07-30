/**
 * Extracts mentioned user IDs from HTML content
 */
export function extractMentionsFromHTML(htmlContent: string): string[] {
	try {
		if (!htmlContent) {
			return [];
		}

		const mentionedUserIds: string[] = [];

		// Use regex to find all data-user-id attributes in mention spans
		const mentionRegex = /data-user-id="([^"]+)"/g;
		let match;

		while ((match = mentionRegex.exec(htmlContent)) !== null) {
			const userId = match[1];
			if (userId) {
				mentionedUserIds.push(userId);
			}
		}

		// Remove duplicates
		return [...new Set(mentionedUserIds)];
	} catch (error) {
		console.error("Error extracting mentions from HTML:", error);
		return [];
	}
}

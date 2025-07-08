import type { ActivityWithActor } from "@/drizzle/types";
import { guessTimezone, toDateStringWithDay } from "../utils/date";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function toDateString(date: any) {
	if (!date) {
		return "-";
	}

	// Handle string dates by parsing them first
	const dateObj = typeof date === "string" ? new Date(date) : date;
	
	// Check if it's a valid date
	if (dateObj instanceof Date && !isNaN(dateObj.getTime())) {
		return toDateStringWithDay(dateObj, guessTimezone);
	}
	
	return "-";
}

// Convert technical field names to user-friendly labels
const fieldLabels: Record<string, string> = {
	name: "name",
	title: "title",
	description: "description",
	status: "status",
	priority: "priority",
	due: "due date",
	dueDate: "due date",
	startDate: "start date",
	endDate: "end date",
	assigneeId: "assignee",
	assignee: "assignee",
	completed: "completion status",
	color: "color",
	position: "position",
	archived: "archive status",
	visibility: "visibility",
};

// Get user-friendly field name
function getFieldLabel(key: string): string {
	return fieldLabels[key] || key.replace(/([A-Z])/g, ' $1').toLowerCase();
}

// Generate contextual action messages
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function generateContextualMessage(item: ActivityWithActor, newValue: any, oldValue: any): string {
	const itemName = newValue?.name ?? newValue?.title ?? oldValue?.name ?? oldValue?.title ?? 'item';
	
	switch (item.action) {
		case 'created':
			switch (item.type) {
				case 'task':
					return `created task **${itemName}**`;
				case 'tasklist':
					return `created task list **${itemName}**`;
				case 'project':
					return `created project **${itemName}**`;
				case 'event':
					return `created event **${itemName}**`;
				case 'comment':
					return "added a comment";
				case 'blob':
					return "uploaded a file";
				default:
					return `created ${item.type} **${itemName}**`;
			}
			
		case 'deleted':
			switch (item.type) {
				case 'task':
					return `deleted task **${itemName}**`;
				case 'tasklist':
					return `deleted task list **${itemName}**`;
				case 'project':
					return `deleted project **${itemName}**`;
				case 'event':
					return `deleted event **${itemName}**`;
				case 'comment':
					return "deleted a comment";
				case 'blob':
					return "deleted a file";
				default:
					return `deleted ${item.type} **${itemName}**`;
			}
			
		case 'updated':
			switch (item.type) {
				case 'task':
					return `updated task **${itemName}**`;
				case 'tasklist':
					return `updated task list **${itemName}**`;
				case 'project':
					return `updated project **${itemName}**`;
				case 'event':
					return `updated event **${itemName}**`;
				case 'comment':
					return "updated a comment";
				case 'blob':
					return "updated a file";
				default:
					return `updated ${item.type} **${itemName}**`;
			}
			
		default:
			return `${item.action} ${item.type} **${itemName}**`;
	}
}

export function generateObjectDiffMessage(item: ActivityWithActor) {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const newValue = item.newValue as any;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const oldValue = item.oldValue as any;

	// Generate the main action message
	const mainMessage = generateContextualMessage(item, newValue, oldValue);
	const changes: string[] = [];

	// For creation and deletion, we don't need to show field changes
	if (item.action === 'created' || item.action === 'deleted') {
		return mainMessage;
	}

	// For updates, show specific field changes
	if (newValue && oldValue) {
		const ignoreKeys = ["updatedAt", "createdAt", "repeatRule", "creatorId", "id"];

		for (const key in oldValue) {
			if (ignoreKeys.includes(key)) {
				continue;
			}

			if (key in newValue && oldValue[key] !== newValue[key]) {
				const fieldLabel = getFieldLabel(key);
				
				if (typeof newValue[key] === "string" && (newValue[key] as string)?.length > 250) {
					changes.push(`updated ${fieldLabel}`);
				} else if (newValue[key] instanceof Date || (typeof newValue[key] === "string" && new Date(newValue[key]).toString() !== "Invalid Date")) {
					changes.push(
						`changed ${fieldLabel} from **${toDateString(oldValue[key])}** to **${toDateString(newValue[key])}**`
					);
				} else if (typeof newValue[key] === "boolean") {
					if (key === 'completed') {
						changes.push(newValue[key] ? "marked as completed" : "marked as incomplete");
					} else if (key === 'archived') {
						changes.push(newValue[key] ? "archived" : "unarchived");
					} else {
						changes.push(newValue[key] ? `enabled ${fieldLabel}` : `disabled ${fieldLabel}`);
					}
				} else if (!newValue[key] && oldValue[key]) {
					changes.push(`removed ${fieldLabel}`);
				} else if (newValue[key] && !oldValue[key]) {
					changes.push(`set ${fieldLabel} to **${newValue[key]}**`);
				} else {
					// Handle status changes with better formatting
					if (key === 'status') {
						changes.push(
							`changed status from **${oldValue[key]}** to **${newValue[key]}**`
						);
					} else {
						changes.push(
							`changed ${fieldLabel} from **${oldValue[key]}** to **${newValue[key]}**`
						);
					}
				}
			}
		}
	}

	// Combine main message with changes
	if (changes.length > 0) {
		if (changes.length === 1) {
			return `${mainMessage} • ${changes[0]}`;
		}
		return `${mainMessage}\n\n${changes.map(change => `• ${change}`).join('\n')}`;
	}

	return mainMessage;
}

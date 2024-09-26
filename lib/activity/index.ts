import { activity } from "@/drizzle/schema";
import dayjs from "dayjs";
import { database } from "../utils/useDatabase";
import { getOwner, getTimezone } from "../utils/useOwner";

type GenericObject = {
	[key: string]:
		| string
		| number
		| boolean
		| Date
		| null
		| undefined
		| GenericObject;
};

export async function logActivity({
	action,
	type,
	message,
	projectId,
}: {
	action: "created" | "updated" | "deleted";
	type:
		| "tasklist"
		| "task"
		| "project"
		| "document"
		| "blob"
		| "folder"
		| "event"
		| "comment";
	message: string;
	projectId: number;
}) {
	const db = await database();
	const { userId } = await getOwner();
	await db
		.insert(activity)
		.values({
			action,
			type,
			message,
			projectId,
			userId,
			createdAt: new Date(),
		})
		.run();
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function toDateString(date: any) {
	if (!date) {
		return "-";
	}

	const tz = getTimezone();
	return dayjs(date).tz(tz).format("YYYY-MM-DD HH:mm:ss");
}

export function generateObjectDiffMessage(
	original: GenericObject,
	updated: GenericObject,
) {
	if (!original || !updated) {
		return "";
	}

	const ignoreKeys = ["updatedAt", "createdAt", "repeatRule"];

	const message: string[] = [];

	for (const key in original) {
		if (ignoreKeys.includes(key)) {
			continue;
		}

		if (key in updated) {
			if (original[key] !== updated[key]) {
				if (
					typeof updated[key] === "string" &&
					(updated[key] as string)?.length > 250
				) {
					message.push(`changed \`${key}\``);
				} else if (updated[key] instanceof Date) {
					message.push(
						`changed \`${key}\` from \`${toDateString(original[key])}\` to \`${toDateString(
							updated[key],
						)}\``,
					);
				} else if (typeof updated[key] === "boolean") {
					if (updated[key]) {
						message.push(`enabled \`${key}\``);
					} else {
						message.push(`disabled \`${key}\``);
					}
				} else if (!updated[key]) {
					message.push(`\`${key}\` removed`);
				} else {
					message.push(
						`changed \`${key}\` from \`${original[key] ?? "empty"}\` to \`${updated[key]}\``,
					);
				}
			}
		}
	}

	return message.join(", ");
}

import type { ActivityWithActor } from "@/drizzle/types";
import { guessTimezone, toDateStringWithDay } from "../utils/date";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function toDateString(date: any) {
	if (!date) {
		return "-";
	}

	return toDateStringWithDay(date, guessTimezone);
}

export function generateObjectDiffMessage(item: ActivityWithActor) {
	const message: string[] = [
		`${item.type.charAt(0).toUpperCase() + item.type.slice(1)} ${item.action}`,
	];

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const newValue = item.newValue as any;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const oldValue = item.oldValue as any;

	if (newValue && !oldValue) {
		message.push(
			`created ${item.type} \`${newValue?.name ?? newValue?.title ?? newValue?.id}\``,
		);
	}

	if (!newValue && oldValue) {
		message.push(
			`deleted ${item.type} \`${oldValue?.name ?? oldValue?.title ?? oldValue?.id}\``,
		);
	}

	if (newValue && oldValue) {
		console.log(oldValue, newValue);
		const ignoreKeys = ["updatedAt", "createdAt", "repeatRule", "creatorId"];

		for (const key in oldValue) {
			if (ignoreKeys.includes(key)) {
				continue;
			}

			if (key in newValue) {
				if (oldValue[key] !== newValue[key]) {
					if (
						typeof newValue[key] === "string" &&
						(newValue[key] as string)?.length > 250
					) {
						message.push(`changed \`${key}\``);
					} else if (newValue[key] instanceof Date) {
						message.push(
							`changed \`${key}\` from \`${toDateString(oldValue[key])}\` to \`${toDateString(
								newValue[key],
							)}\``,
						);
					} else if (typeof newValue[key] === "boolean") {
						if (newValue[key]) {
							message.push(`enabled \`${key}\``);
						} else {
							message.push(`disabled \`${key}\``);
						}
					} else if (!newValue[key]) {
						message.push(`\`${key}\` removed`);
					} else {
						message.push(
							`changed \`${key}\` from \`${oldValue[key] ?? "empty"}\` to \`${newValue[key]}\``,
						);
					}
				}
			}
		}
	}

	return message.join(", ");
}

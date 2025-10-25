import { activity } from "@/drizzle/schema";
import { database } from "../utils/useDatabase";
import { getOwner } from "../utils/useOwner";

type GenericObject = {
	[key: string]:
		| string
		| number
		| boolean
		| Date
		| null
		| undefined
		| unknown
		| GenericObject;
};

export async function logActivity({
	action,
	type,
	oldValue,
	newValue,
	target,
	projectId,
}: {
	action: "created" | "updated" | "deleted";
	type: "tasklist" | "task" | "project" | "blob" | "event" | "comment" | "post";
	oldValue?: GenericObject;
	newValue?: GenericObject;
	target?: string;
	projectId: number;
}) {
	const db = await database();
	const { userId } = await getOwner();
	await db
		.insert(activity)
		.values({
			action,
			type,
			oldValue,
			newValue,
			target,
			projectId,
			userId,
		})
		.execute();
}

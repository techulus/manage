"use server";

import { calendarEvent, eventInvite } from "@/drizzle/schema";
import { generateObjectDiffMessage, logActivity } from "@/lib/activity";
import { database } from "@/lib/utils/useDatabase";
import { getOwner, getTimezone } from "@/lib/utils/useOwner";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type Frequency, RRule } from "rrule";

dayjs.extend(timezone);
dayjs.extend(utc);

export async function createEvent(payload: FormData) {
	const { userId, orgSlug } = await getOwner();
	const projectId = +(payload.get("projectId") as string);
	const name = payload.get("name") as string;
	const description = payload.get("description") as string;
	const start = dayjs.utc(payload.get("start") as string);
	const allDay = (payload.get("allDay") as string) === "on";
	const repeat = payload.get("repeat") as string;
	const invites = ((payload.get("invites") as string) ?? "")
		.split(",")
		.filter(Boolean);

	let end = payload.get("end") ? dayjs.utc(payload.get("end") as string) : null;
	if (allDay && end) {
		end = end.endOf("day");
	}

	const repeatRule = repeat
		? new RRule({
				freq: repeat as unknown as Frequency,
				dtstart: start.toDate(),
				until: end ? end.toDate() : null,
				tzid: "UTC",
			})
		: undefined;

	const db = await database();
	const createdEvent = await db
		.insert(calendarEvent)
		.values({
			name,
			description,
			start: start.toDate(),
			end: end?.toDate(),
			allDay,
			repeatRule: repeatRule?.toString(),
			projectId,
			createdByUser: userId,
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.returning()
		.get();

	for (const userId of invites) {
		await db
			.insert(eventInvite)
			.values({
				eventId: createdEvent.id,
				userId,
				status: "invited",
			})
			.run();
	}

	await logActivity({
		action: "created",
		type: "event",
		message: `Created event ${name}`,
		projectId: +projectId,
	});

	const timezone = await getTimezone();

	revalidatePath(`/${orgSlug}/projects/${projectId}/events`);
	redirect(
		`/${orgSlug}/projects/${projectId}/events?on=${start.tz(timezone).format("YYYY-MM-DD")}`,
	);
}

export async function updateEvent(payload: FormData) {
	const { orgSlug } = await getOwner();
	const id = +(payload.get("id") as string);
	const name = payload.get("name") as string;
	const description = payload.get("description") as string;
	const start = dayjs.utc(payload.get("start") as string);
	const allDay = (payload.get("allDay") as string) === "on";
	const repeat = payload.get("repeat") as string;
	const projectId = payload.get("projectId") as string;
	const invites = ((payload.get("invites") as string) ?? "")
		.split(",")
		.filter(Boolean);

	let end = payload.get("end") ? dayjs.utc(payload.get("end") as string) : null;
	if (allDay && end) {
		end = end.endOf("day");
	}

	const repeatRule = repeat
		? new RRule({
				freq: repeat as unknown as Frequency,
				dtstart: start.toDate(),
				until: end ? end.toDate() : null,
				tzid: "UTC",
			})
		: undefined;

	const db = await database();
	await db.delete(eventInvite).where(eq(eventInvite.eventId, id)).run();

	for (const userId of invites) {
		await db
			.insert(eventInvite)
			.values({
				eventId: id,
				userId,
				status: "invited",
			})
			.run();
	}

	const currentEvent = await db.query.calendarEvent
		.findFirst({
			where: and(
				eq(calendarEvent.id, id),
				eq(calendarEvent.projectId, +projectId),
			),
		})
		.execute();

	await db
		.update(calendarEvent)
		.set({
			name,
			description,
			start: start.toDate(),
			end: end?.toDate(),
			allDay,
			repeatRule: repeatRule?.toString(),
			updatedAt: new Date(),
		})
		.where(
			and(eq(calendarEvent.id, id), eq(calendarEvent.projectId, +projectId)),
		)
		.run();

	if (currentEvent)
		await logActivity({
			action: "updated",
			type: "event",
			message: `Updated event ${name}, ${generateObjectDiffMessage(
				currentEvent,
				{
					name,
					description,
					start: start.toDate(),
					end: end?.toDate(),
					allDay,
				},
			)}`,
			projectId: +projectId,
		});

	const timezone = await getTimezone();

	revalidatePath(`/${orgSlug}/projects/${projectId}/events`);
	redirect(
		`/${orgSlug}/projects/${projectId}/events?on=${start.tz(timezone).format("YYYY-MM-DD")}`,
	);
}

export async function deleteEvent(payload: FormData) {
	const id = +(payload.get("id") as string);
	const currentPath = payload.get("currentPath") as string;
	const projectId = payload.get("projectId") as string;

	const db = await database();
	const eventDetails = await db
		.delete(calendarEvent)
		.where(eq(calendarEvent.id, id))
		.returning()
		.get();

	await logActivity({
		action: "deleted",
		type: "event",
		message: `Deleted event ${eventDetails?.name}`,
		projectId: +projectId,
	});

	revalidatePath(currentPath);
}

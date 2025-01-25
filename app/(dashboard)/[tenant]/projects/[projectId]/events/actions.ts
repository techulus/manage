"use server";

import { calendarEvent, eventInvite } from "@/drizzle/schema";
import { generateObjectDiffMessage, logActivity } from "@/lib/activity";
import { toEndOfDay, toMachineDateString } from "@/lib/utils/date";
import { database } from "@/lib/utils/useDatabase";
import { getOwner, getTimezone } from "@/lib/utils/useOwner";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type Frequency, RRule } from "rrule";
import { ZodError, ZodIssueCode, z } from "zod";

const eventInputSchema = z.object({
	projectId: z.string(),
	name: z.string(),
	description: z.string().optional(),
	start: z.string(),
	end: z.string().optional(),
	allDay: z.boolean(),
	repeat: z.string().optional(),
	repeatUntil: z.string().optional(),
	invites: z.array(z.string()).optional(),
});

function handleEventPayload(payload: FormData): {
	projectId: number;
	name: string;
	description: string;
	start: Date;
	end: Date | null;
	allDay: boolean;
	repeatRule?: string;
	invites: string[];
} {
	const data = eventInputSchema.parse({
		projectId: payload.get("projectId"),
		name: payload.get("name"),
		description: payload.get("description"),
		start: payload.get("start"),
		end: payload.get("end"),
		allDay: (payload.get("allDay") as string) === "on",
		repeat: payload.get("repeat"),
		repeatUntil: payload.get("repeatUntil"),
		invites: ((payload.get("invites") as string) ?? "")
			.split(",")
			.filter(Boolean),
	});

	const event = {
		projectId: +data.projectId,
		name: data.name,
		description: data.description,
		start: new Date(data.start),
		end: data.end ? new Date(data.end) : null,
		allDay: data.allDay,
		invites: data.invites ?? [],
		repeatRule: data.repeat
			? new RRule({
					freq: data.repeat as unknown as Frequency,
					dtstart: new Date(data.start),
					until: data.repeatUntil
						? toEndOfDay(new Date(data.repeatUntil))
						: undefined,
					tzid: "UTC",
				}).toString()
			: undefined,
	};

	if (event.allDay && event.end) {
		event.end = toEndOfDay(event.end);
	}

	if (event.end && event.end > event.start) {
		throw new ZodError([
			{
				message: "End date must be after start date",
				code: ZodIssueCode.custom,
				path: ["end"],
			},
		]);
	}

	return event;
}

export async function createEvent(payload: FormData) {
	const { userId, orgSlug } = await getOwner();

	const {
		projectId,
		name,
		description,
		start,
		end,
		allDay,
		repeatRule,
		invites,
	} = handleEventPayload(payload);

	const db = await database();
	const createdEvent = db
		.insert(calendarEvent)
		.values({
			name,
			description,
			start,
			end,
			allDay,
			repeatRule,
			projectId,
			createdByUser: userId,
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.returning()
		.get();

	for (const userId of invites) {
		db.insert(eventInvite)
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
		`/${orgSlug}/projects/${projectId}/events?on=${toMachineDateString(start, timezone)}`,
	);
}

export async function updateEvent(payload: FormData) {
	const { orgSlug } = await getOwner();
	const id = +(payload.get("id") as string);

	const {
		projectId,
		name,
		description,
		start,
		end,
		allDay,
		repeatRule,
		invites,
	} = handleEventPayload(payload);

	const db = await database();
	db.delete(eventInvite).where(eq(eventInvite.eventId, id)).run();

	for (const userId of invites) {
		db.insert(eventInvite)
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

	db.update(calendarEvent)
		.set({
			name,
			description,
			start,
			end,
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
					start,
					end,
					allDay,
				},
			)}`,
			projectId: +projectId,
		});

	const timezone = await getTimezone();

	revalidatePath(`/${orgSlug}/projects/${projectId}/events`);
	redirect(
		`/${orgSlug}/projects/${projectId}/events?on=${toMachineDateString(start, timezone)}`,
	);
}

export async function deleteEvent(payload: FormData) {
	const id = +(payload.get("id") as string);
	const currentPath = payload.get("currentPath") as string;
	const projectId = payload.get("projectId") as string;

	const db = await database();
	const eventDetails = db
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

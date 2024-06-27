"use server";

import { calendarEvent, eventInvite } from "@/drizzle/schema";
import { getEndOfDay, getStartOfDay } from "@/lib/utils/time";
import { database } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Frequency, RRule } from "rrule";

export async function createEvent(payload: FormData) {
  const { userId } = getOwner();
  const projectId = +(payload.get("projectId") as string);
  const name = payload.get("name") as string;
  const description = payload.get("description") as string;
  const start = new Date(payload.get("start") as string);
  const end = payload.get("end")
    ? new Date(payload.get("end") as string)
    : null;
  const allDay = (payload.get("allDay") as string) === "on";
  const repeat = payload.get("repeat") as string;
  const invites = ((payload.get("invites") as string) ?? "")
    .split(",")
    .filter(Boolean);

  const repeatRule = repeat
    ? new RRule({
        freq: repeat as unknown as Frequency,
        dtstart: start,
        until: end,
      })
    : undefined;

  const createdEvent = await database()
    .insert(calendarEvent)
    .values({
      name,
      description,
      start,
      end,
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
    await database()
      .insert(eventInvite)
      .values({
        eventId: createdEvent.id,
        userId,
        status: "invited",
      })
      .run();
  }

  revalidatePath(`/console/projects/${projectId}`);
  redirect(`/console/projects/${projectId}`);
}

export async function updateEvent(payload: FormData) {
  const id = +(payload.get("id") as string);
  const name = payload.get("name") as string;
  const description = payload.get("description") as string;
  const start = new Date(payload.get("start") as string);
  const end = payload.get("end")
    ? new Date(payload.get("end") as string)
    : null;
  const allDay = (payload.get("allDay") as string) === "on";
  const repeat = payload.get("repeat") as string;
  const projectId = payload.get("projectId") as string;
  const invites = ((payload.get("invites") as string) ?? "")
    .split(",")
    .filter(Boolean);

  const repeatRule = repeat
    ? new RRule({
        freq: repeat as unknown as Frequency,
        dtstart: getStartOfDay(start),
        until: end ? getEndOfDay(end) : null,
      })
    : undefined;

  await database().delete(eventInvite).where(eq(eventInvite.eventId, id)).run();

  for (const userId of invites) {
    await database()
      .insert(eventInvite)
      .values({
        eventId: id,
        userId,
        status: "invited",
      })
      .run();
  }

  await database()
    .update(calendarEvent)
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
      and(eq(calendarEvent.id, id), eq(calendarEvent.projectId, +projectId))
    )
    .run();

  revalidatePath(`/console/projects/${projectId}/events`);
  redirect(`/console/projects/${projectId}/events?date=${start.toISOString()}`);
}

export async function deleteEvent(payload: FormData) {
  const id = +(payload.get("id") as string);
  const currentPath = payload.get("currentPath") as string;

  await database().delete(calendarEvent).where(eq(calendarEvent.id, id)).run();

  revalidatePath(currentPath);
}

"use server";

import { calendarEvent } from "@/drizzle/schema";
import { database } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { eq } from "drizzle-orm";
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

  const repeatRule = repeat
    ? new RRule({
        freq: repeat as unknown as Frequency,
        dtstart: start,
        until: end,
      })
    : undefined;

  await database()
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
    .run();

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

  const repeatRule = repeat
    ? new RRule({
        freq: repeat as unknown as Frequency,
        dtstart: start,
        until: end,
      })
    : undefined;

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
    .where(eq(calendarEvent.id, id))
    .run();

  revalidatePath(`/console/projects/${id}/events`);
  redirect(`/console/projects/${id}/events?date=${start.toISOString()}`);
}

export async function deleteEvent(payload: FormData) {
  const id = +(payload.get("id") as string);
  const currentPath = payload.get("currentPath") as string;

  await database().delete(calendarEvent).where(eq(calendarEvent.id, id)).run();

  revalidatePath(currentPath);
}

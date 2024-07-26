"use server";

import { calendarEvent, eventInvite } from "@/drizzle/schema";
import { generateObjectDiffMessage, logActivity } from "@/lib/activity";
import { database } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Frequency, RRule } from "rrule";
dayjs.extend(utc);

export async function createEvent(payload: FormData) {
  const { userId } = await getOwner();
  const projectId = +(payload.get("projectId") as string);
  const name = payload.get("name") as string;
  const description = payload.get("description") as string;
  const start = dayjs(payload.get("start") as string)
    .utc()
    .toDate();
  const end = payload.get("end")
    ? dayjs(payload.get("end") as string)
        .utc()
        .toDate()
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

  const db = await database();
  const createdEvent = await db
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
    parentId: createdEvent.id,
    projectId: +projectId,
  });

  revalidatePath(`/console/projects/${projectId}/events`);
  redirect(`/console/projects/${projectId}/events?date=${start.toISOString()}`);
}

export async function updateEvent(payload: FormData) {
  const id = +(payload.get("id") as string);
  const name = payload.get("name") as string;
  const description = payload.get("description") as string;
  const start = dayjs(payload.get("start") as string)
    .utc()
    .toDate();
  const end = payload.get("end")
    ? dayjs(payload.get("end") as string)
        .utc()
        .toDate()
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
        dtstart: dayjs(start).startOf("day").toDate(),
        until: end ? dayjs(end).endOf("day").toDate() : null,
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
        eq(calendarEvent.projectId, +projectId)
      ),
    })
    .execute();

  await db
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

  await logActivity({
    action: "updated",
    type: "event",
    message: `Updated event ${name}, ${generateObjectDiffMessage(currentEvent, {
      name,
      description,
      start,
      end,
      allDay,
    })}`,
    parentId: id,
    projectId: +projectId,
  });

  revalidatePath(`/console/projects/${projectId}/events`);
  redirect(`/console/projects/${projectId}/events?date=${start.toISOString()}`);
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
    parentId: id,
    projectId: +projectId,
  });

  revalidatePath(currentPath);
}

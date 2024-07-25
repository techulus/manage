import { NextRequest } from "next/server";
import ical, { ICalCalendarMethod } from "ical-generator";
import { getDatabaseForOwner } from "@/lib/utils/useDatabase";
import { calendarEvent, project } from "@/drizzle/schema";
import { and, desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _: NextRequest,
  { params }: { params: { projectId: string; ownerId: string } }
) {
  const { projectId, ownerId } = params;

  const db = getDatabaseForOwner(ownerId);

  const projectDetails = await db.query.project
    .findFirst({
      where: eq(project.id, +projectId),
    })
    .execute();

  if (!projectDetails) {
    return new Response("Project not found", { status: 404 });
  }

  const events = await db.query.calendarEvent
    .findMany({
      where: and(eq(calendarEvent.projectId, +projectId)),
      orderBy: [desc(calendarEvent.start)],
    })
    .execute();

  const calendar = ical({ name: projectDetails.name });

  calendar.method(ICalCalendarMethod.REQUEST);

  events.forEach((event) => {
    calendar.createEvent({
      id: event.id,
      start: event.start,
      end: event.end,
      summary: event.name,
      description: event.description,
      allDay: event.allDay,
      created: event.createdAt,
      lastModified: event.updatedAt,
    });
  });

  const headers = new Headers();
  headers.set("Content-Type", "text/calendar; charset=utf-8");
  headers.set("Content-Disposition", "attachment; filename=calendar.ics");

  return new Response(calendar.toString(), {
    headers,
  });
}

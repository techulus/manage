import { calendarEvent, project } from "@/drizzle/schema";
import { getDatabaseForOwner } from "@/lib/utils/useDatabase";
import { and, desc, eq } from "drizzle-orm";
import ical, { ICalCalendarMethod } from "ical-generator";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET(
  _: Request,
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
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  headers.set("Pragma", "no-cache");
  headers.set("Expires", "0");

  return new Response(calendar.toString(), {
    headers,
  });
}

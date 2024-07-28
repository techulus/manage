import { calendarEvent, project, task, taskList } from "@/drizzle/schema";
import { getDatabaseForOwner } from "@/lib/utils/turso";
import { and, desc, eq, lte } from "drizzle-orm";
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

  const [events, tasklists] = await Promise.all([
    db.query.calendarEvent
      .findMany({
        where: and(eq(calendarEvent.projectId, +projectId)),
        orderBy: [desc(calendarEvent.start)],
      })
      .execute(),
    db.query.taskList.findMany({
      where: and(eq(taskList.projectId, +projectId)),
      with: {
        tasks: {
          where: and(eq(task.status, "todo"), lte(task.dueDate, new Date())),
          orderBy: [desc(task.dueDate)],
        },
      },
    }),
  ]);

  const calendar = ical({ name: projectDetails.name });

  calendar.method(ICalCalendarMethod.REQUEST);

  for (const event of events) {
    calendar.createEvent({
      id: event.id,
      start: event.start,
      end: event.end,
      summary: event.name,
      description: event.description,
      allDay: event.allDay,
      created: event.createdAt,
      lastModified: event.updatedAt,
      repeating: event.repeatRule,
      timezone: "UTC",
    });
  }

  for (const tasklist of tasklists) {
    if (tasklist.tasks.length === 0) {
      continue;
    }
    for (const task of tasklist.tasks) {
      if (task.dueDate === null) {
        continue;
      }

      calendar.createEvent({
        id: task.id,
        start: task.dueDate,
        end: task.dueDate,
        summary: `[${tasklist.name}] ${task.name}`,
        description: task.description,
        allDay: true,
        created: task.createdAt,
        lastModified: task.updatedAt,
        timezone: "UTC",
      });
    }
  }

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

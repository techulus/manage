import { calendarEvent, project, task, taskList } from "@/drizzle/schema";
import { getUser } from "@/lib/ops/auth";
import { getDatabaseForOwner } from "@/lib/utils/useDatabase";
import { and, desc, eq, lte } from "drizzle-orm";
import ical, { ICalCalendarMethod } from "ical-generator";
import type { NextRequest } from "next/server";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET(
	request: NextRequest,
	props: {
		params: Promise<{ projectId: string; ownerId: string }>;
	},
) {
	const params = await props.params;
	const searchParams = request.nextUrl.searchParams;
	const { projectId, ownerId } = params;

	let timezone: string | null = null;
	const userId = searchParams.get("userId");
	if (userId) {
		const user = await getUser(userId);
		if (user.customData?.timezone) {
			timezone = user.customData.timezone;
		}
	}

	const db = await getDatabaseForOwner(ownerId);

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

	const calendar = ical({
		name: projectDetails.name,
		method: ICalCalendarMethod.PUBLISH,
	});

	for (const event of events) {
		calendar.createEvent({
			id: event.id,
			start: timezone
				? event.start.toLocaleString("en-US", { timeZone: timezone })
				: event.start,
			end: event.end
				? timezone
					? event.end.toLocaleString("en-US", { timeZone: timezone })
					: event.end
				: null,
			summary: event.name,
			description: event.description,
			allDay: event.allDay,
			created: event.createdAt,
			lastModified: event.updatedAt,
			repeating: event.repeatRule,
			timezone,
		});
	}

	for (const tasklist of tasklists) {
		if (tasklist.tasks?.length === 0) {
			continue;
		}
		for (const task of tasklist.tasks) {
			if (task.dueDate === null) {
				continue;
			}

			calendar.createEvent({
				id: task.id,
				start: timezone
					? task.dueDate.toLocaleString("en-US", { timeZone: timezone })
					: task.dueDate,
				end: timezone
					? task.dueDate.toLocaleString("en-US", { timeZone: timezone })
					: task.dueDate,
				summary: `[${tasklist.name}] ${task.name}`,
				description: task.description,
				allDay: true,
				created: task.createdAt,
				lastModified: task.updatedAt,
				timezone,
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

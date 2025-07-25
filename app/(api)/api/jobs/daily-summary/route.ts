import { DailySummary } from "@/components/emails/daily-summary";
import { calendarEvent, task, user as userSchema } from "@/drizzle/schema";
import { TaskStatus } from "@/drizzle/types";
import { getDatabaseForOwner } from "@/lib/utils/useDatabase";
import {
	filterByRepeatRule,
	getStartEndDateRangeInUtc,
} from "@/lib/utils/useEvents";
import { opsUser } from "@/ops/drizzle/schema";
import { getOpsDatabase } from "@/ops/useOps";
import { serve } from "@upstash/workflow/nextjs";
import { and, between, eq, gte, isNotNull, lt, or } from "drizzle-orm";
import { Resend } from "resend";

export const { POST } = serve(async (context) => {
	const resend = new Resend(process.env.RESEND_API_KEY);
	console.log(
		`[DailySummary] Starting daily summary job at ${new Date().toISOString()}`,
	);

	// Step 1: Get active users from ops database (active in last 7 days)
	const users = await context.run("fetch-users", async () => {
		const opsDb = await getOpsDatabase();
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

		const users = await opsDb
			.select()
			.from(opsUser)
			.where(gte(opsUser.lastActiveAt, sevenDaysAgo));
		console.log(
			`[DailySummary] Found ${users.length} active users (last 7 days)`,
		);
		return users;
	});

	// Step 2: Process users
	await context.run("process-users", async () => {
		console.log(`[DailySummary] Processing ${users.length} users`);

		for (const userData of users) {
			try {
				await processUserSummary(
					userData.id,
					userData.email,
					userData.firstName,
					resend,
				);
			} catch (error) {
				console.error(
					`[DailySummary] Error processing user ${userData.email}:`,
					error,
				);
			}
		}
	});

	console.log(
		`[DailySummary] Daily summary job completed at ${new Date().toISOString()}`,
	);
});

async function processUserSummary(
	userId: string,
	email: string,
	firstName: string | undefined | null,
	resend: Resend,
) {
	try {
		console.log(
			`[DailySummary] Processing summary for user ${email} (${userId})`,
		);

		// Get user's database and timezone
		const db = await getDatabaseForOwner(userId);
		const userDetails = await db.query.user.findFirst({
			where: eq(userSchema.id, userId),
			columns: {
				timeZone: true,
			},
		});

		if (!userDetails) {
			console.log(
				`[DailySummary] User ${email} not found in main database, skipping`,
			);
			return;
		}

		const timezone = userDetails.timeZone || "UTC";
		console.log(`[DailySummary] Using timezone ${timezone} for user ${email}`);

		// Get today's data using the same logic as getTodayData
		const today = new Date();
		const { startOfDay, endOfDay } = getStartEndDateRangeInUtc(timezone, today);

		const [tasksDueToday, overDueTasks, events] = await Promise.all([
			// Tasks due today
			db.query.task.findMany({
				where: and(
					between(task.dueDate, startOfDay, endOfDay),
					eq(task.status, TaskStatus.TODO),
					isNotNull(task.dueDate),
				),
				columns: {
					name: true,
					dueDate: true,
					id: true,
				},
				with: {
					taskList: {
						columns: {
							id: true,
							status: true,
							name: true,
						},
						with: {
							project: {
								columns: {
									id: true,
									name: true,
								},
							},
						},
					},
				},
			}),
			// Overdue tasks
			db.query.task.findMany({
				where: and(
					lt(task.dueDate, startOfDay),
					eq(task.status, TaskStatus.TODO),
					isNotNull(task.dueDate),
				),
				columns: {
					name: true,
					dueDate: true,
					id: true,
				},
				with: {
					taskList: {
						columns: {
							id: true,
							status: true,
							name: true,
						},
						with: {
							project: {
								columns: {
									id: true,
									name: true,
								},
							},
						},
					},
				},
			}),
			// Today's events
			db.query.calendarEvent.findMany({
				where: and(
					or(
						between(calendarEvent.start, startOfDay, endOfDay),
						between(calendarEvent.end, startOfDay, endOfDay),
						and(
							lt(calendarEvent.start, startOfDay),
							between(calendarEvent.end, startOfDay, endOfDay),
						),
						isNotNull(calendarEvent.repeatRule),
						eq(calendarEvent.start, startOfDay),
						eq(calendarEvent.end, endOfDay),
					),
				),
				with: {
					project: {
						columns: {
							id: true,
							name: true,
						},
					},
				},
			}),
		]);

		// Filter events by repeat rule
		const filteredEvents = events.filter((event) =>
			filterByRepeatRule(event, today, timezone),
		);

		// Only send email if user has relevant content
		const hasContent =
			tasksDueToday.length > 0 ||
			overDueTasks.length > 0 ||
			filteredEvents.length > 0;

		if (!hasContent) {
			console.log(
				`[DailySummary] No content for user ${email}, skipping email`,
			);
			return;
		}

		console.log(
			`[DailySummary] Sending summary to ${email}: ${overDueTasks.length} overdue, ${tasksDueToday.length} due today, ${filteredEvents.length} events`,
		);

		// Send daily summary email
		await resend.emails.send({
			from: "daily-summary@email.managee.xyz",
			to: email,
			subject: `🌅 Your Daily Summary - ${getFormattedDate(today, timezone)} ✨`,
			react: DailySummary({
				firstName: firstName || undefined,
				email,
				timezone,
				date: today,
				overdueTasks: overDueTasks,
				dueToday: tasksDueToday,
				events: filteredEvents,
			}),
		});

		console.log(`[DailySummary] Successfully sent summary email to ${email}`);
	} catch (error) {
		console.error(
			`[DailySummary] Error processing summary for ${email}:`,
			error,
		);
	}
}

function getFormattedDate(date: Date, timezone: string): string {
	try {
		return new Intl.DateTimeFormat("en-US", {
			timeZone: timezone,
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		}).format(date);
	} catch (error) {
		// Fallback to UTC if timezone is invalid
		return new Intl.DateTimeFormat("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		}).format(date);
	}
}

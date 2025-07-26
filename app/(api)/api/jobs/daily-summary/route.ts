import { serve } from "@upstash/workflow/nextjs";
import { gte } from "drizzle-orm";
import { Resend } from "resend";
import {
	DailySummary,
	dailySummaryPlainText,
} from "@/components/emails/daily-summary";
import { getTodayDataForUser } from "@/lib/utils/todayData";
import { getDatabaseForOwner } from "@/lib/utils/useDatabase";
import { opsUser } from "@/ops/drizzle/schema";
import { getOpsDatabase } from "@/ops/useOps";

function isCurrentlySevenAM(timezone: string): boolean {
	try {
		const now = new Date();
		const userTime = new Intl.DateTimeFormat("en-US", {
			timeZone: timezone,
			hour: "numeric",
			hour12: false,
		}).format(now);

		const hour = Number.parseInt(userTime.split(" ")[0] || userTime, 10);
		return hour === 7;
	} catch (error) {
		console.error(
			`[DailySummary] Error checking time for timezone ${timezone}:`,
			error,
		);
		return false;
	}
}

export const { POST } = serve(async (context) => {
	const resend = new Resend(process.env.RESEND_API_KEY);
	console.log(
		`[DailySummary] Starting daily summary job at ${new Date().toISOString()}`,
	);

	// Step 1: Get active users from ops database (active in last 7 days) and filter by 7AM timezone
	const users = await context.run("fetch-users", async () => {
		const opsDb = await getOpsDatabase();
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

		const allUsers = await opsDb
			.select()
			.from(opsUser)
			.where(gte(opsUser.lastActiveAt, sevenDaysAgo));
		console.log(
			`[DailySummary] Found ${allUsers.length} active users (last 7 days)`,
		);

		// Filter users where it's currently 7AM in their timezone
		const usersAt7AM = allUsers.filter((user) => {
			const userTimezone = user.timeZone || "UTC";
			return isCurrentlySevenAM(userTimezone);
		});

		console.log(
			`[DailySummary] Found ${usersAt7AM.length} users where it's currently 7AM`,
		);
		return usersAt7AM;
	});

	// Step 2: Process users
	await context.run("process-users", async () => {
		console.log(`[DailySummary] Processing ${users.length} users`);

		for (const userData of users) {
			try {
				const userTimezone = userData.timeZone || "UTC";
				await processUserSummary(
					userData.id,
					userData.email,
					userData.firstName,
					userTimezone,
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
	timezone: string,
	resend: Resend,
) {
	try {
		console.log(
			`[DailySummary] Processing summary for user ${email} (${userId}) at timezone ${timezone}`,
		);

		// Get user's database
		const db = await getDatabaseForOwner(userId);

		// Get today's data using the same logic as getTodayData
		const today = new Date();
		const { dueToday, overDue, events } = await getTodayDataForUser(
			db,
			timezone,
			today,
		);

		// Only send email if user has relevant content
		const hasContent =
			dueToday.length > 0 || overDue.length > 0 || events.length > 0;

		if (!hasContent) {
			console.log(
				`[DailySummary] No content for user ${email}, skipping email`,
			);
			return;
		}

		console.log(
			`[DailySummary] Sending summary to ${email}: ${overDue.length} overdue, ${dueToday.length} due today, ${events.length} events`,
		);

		// Send daily summary email
		await resend.emails.send({
			from: "Manage Daily Summary <daily-summary@email.managee.xyz>",
			to: email,
			subject: `🌅 Your Daily Summary - ${getFormattedDate(today, timezone)} ✨`,
			react: DailySummary({
				firstName: firstName || undefined,
				email,
				timezone,
				date: today,
				overdueTasks: overDue,
				dueToday: dueToday,
				events: events,
			}),
			text: dailySummaryPlainText({
				firstName: firstName || undefined,
				email,
				timezone,
				date: today,
				overdueTasks: overDue,
				dueToday: dueToday,
				events: events,
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
		console.error(
			`[DailySummary] Error formatting date for timezone ${timezone}:`,
			error,
		);
		// Fallback to UTC if timezone is invalid
		return new Intl.DateTimeFormat("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		}).format(date);
	}
}

import { DailySummary, dailySummaryPlainText } from "@/components/emails/daily-summary";
import { user as userSchema } from "@/drizzle/schema";
import { getTodayDataForUser } from "@/lib/utils/todayData";
import { getDatabaseForOwner } from "@/lib/utils/useDatabase";
import { opsUser } from "@/ops/drizzle/schema";
import { getOpsDatabase } from "@/ops/useOps";
import { serve } from "@upstash/workflow/nextjs";
import { eq, gte } from "drizzle-orm";
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
		const { dueToday, overDue, events } = await getTodayDataForUser(
			db,
			timezone,
			today,
		);

		// Only send email if user has relevant content
		const hasContent =
			dueToday.length > 0 ||
			overDue.length > 0 ||
			events.length > 0;

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
		// Fallback to UTC if timezone is invalid
		return new Intl.DateTimeFormat("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		}).format(date);
	}
}

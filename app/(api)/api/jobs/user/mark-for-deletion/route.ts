import { clerkClient } from "@clerk/nextjs/server";
import { serve } from "@upstash/workflow/nextjs";
import { and, eq, isNull, lte } from "drizzle-orm";
import { Resend } from "resend";
import {
	SevenDayWarning,
	sevenDayWarningPlainText,
} from "@/components/emails/seven-day-warning";
import {
	ThirtyDayDeletionNotice,
	thirtyDayDeletionNoticePlainText,
} from "@/components/emails/thirty-day-deletion-notice";
import { opsUser } from "@/ops/drizzle/schema";
import { getOpsDatabase } from "@/ops/useOps";

async function getUserDetails(user: {
	id: string;
	email: string;
	firstName?: string | null;
}) {
	const contactEmail = user.email;
	const firstName = user.firstName || undefined;

	if (!contactEmail) {
		throw new Error(`No email address found for user ${user.id}`);
	}

	return { contactEmail, firstName };
}

async function checkUserOrganizationMembership(
	userId: string,
): Promise<boolean> {
	try {
		const clerk = await clerkClient();
		// Get the user's organization memberships
		const organizationMemberships =
			await clerk.users.getOrganizationMembershipList({
				userId: userId,
			});

		console.log(
			`[UserDeletion] User ${userId} has ${organizationMemberships.data.length} organization memberships`,
		);

		// Return true if user belongs to any organization
		return organizationMemberships.data.length > 0;
	} catch (error) {
		console.error(
			`[UserDeletion] Failed to fetch organization memberships for user ${userId}:`,
			error,
		);
		// If we can't determine organization membership, err on the side of caution
		// and assume the user belongs to an organization (don't delete)
		return true;
	}
}

export const { POST } = serve(async (context) => {
	const resend = new Resend(process.env.RESEND_API_KEY);
	console.log(
		`[UserDeletion] Resend API Key configured: ${process.env.RESEND_API_KEY ? "Yes" : "No"}`,
	);

	console.log(
		"[UserDeletion] Starting user deletion job at",
		new Date().toISOString(),
	);
	const db = await getOpsDatabase();
	const thirtyDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
	console.log(
		"[UserDeletion] Looking for users inactive since:",
		thirtyDaysAgo.toISOString(),
	);

	// Step 1: Mark users for deletion (30 days inactive, not part of any org)
	const usersToMark = await context.run("fetch-users-to-mark", async () => {
		const users = await db
			.select()
			.from(opsUser)
			.where(
				and(
					lte(opsUser.lastActiveAt, thirtyDaysAgo),
					isNull(opsUser.markedForDeletionAt),
				),
			);

		console.log(
			`[UserDeletion] Found ${users.length} inactive users to check for organization membership`,
		);

		// Filter out users who belong to any organization
		const eligibleUsers = [];
		for (const user of users) {
			const belongsToOrg = await checkUserOrganizationMembership(user.id);
			if (!belongsToOrg) {
				eligibleUsers.push(user);
			} else {
				console.log(
					`[UserDeletion] Skipping user ${user.id} (${user.email}) - belongs to organization(s)`,
				);
			}
		}

		console.log(
			`[UserDeletion] Found ${eligibleUsers.length} users eligible for deletion (not part of any organization)`,
		);
		if (eligibleUsers.length > 0) {
			console.log(
				"[UserDeletion] Users to mark:",
				eligibleUsers.map((u) => ({
					id: u.id,
					email: u.email,
					lastActiveAt: u.lastActiveAt?.toISOString(),
				})),
			);
		} else {
			console.log(
				"[UserDeletion] No eligible users found that need to be marked for deletion",
			);
		}
		return eligibleUsers;
	});

	// Step 2: Send 30-day deletion notice and mark users
	await context.run("mark-users-for-deletion", async () => {
		if (usersToMark.length === 0) {
			console.log(
				"[UserDeletion] Skipping step 2: No users to mark for deletion",
			);
			return;
		}

		console.log(
			`[UserDeletion] Processing ${usersToMark.length} users for 30-day deletion notices`,
		);
		for (const user of usersToMark) {
			try {
				// Get user details
				const { contactEmail, firstName } = await getUserDetails(user);

				console.log(
					`[UserDeletion] Processing user ${user.id}, contact email: ${contactEmail}`,
				);

				// Send 30-day deletion notice
				console.log(
					`[UserDeletion] Sending 30-day notice email to ${contactEmail} for user ${user.id}`,
				);
				const emailResult = await resend.emails.send({
					from: "Manage Team <noreply@email.managee.xyz>",
					to: contactEmail,
					subject: "Account Deletion Notice - 30 Days",
					react: ThirtyDayDeletionNotice({
						firstName: firstName,
						email: contactEmail,
						// organizationName is undefined for user deletion
					}),
					text: thirtyDayDeletionNoticePlainText({
						firstName: firstName,
						email: contactEmail,
						// organizationName is undefined for user deletion
					}),
				});
				console.log(
					`[UserDeletion] Email send result for user ${user.id}:`,
					JSON.stringify(emailResult, null, 2),
				);

				// Mark user for deletion
				await db
					.update(opsUser)
					.set({ markedForDeletionAt: new Date() })
					.where(eq(opsUser.id, user.id));

				console.log(
					`[UserDeletion] Successfully marked user ${user.id} (${contactEmail}) for deletion`,
				);
			} catch (error) {
				console.error(
					`[UserDeletion] Failed to process user ${user.id}:`,
					error,
				);
			}
		}
	});

	// Step 3: Send 7-day warning to users marked 23 days ago
	const usersFor7DayWarning = await context.run(
		"fetch-users-for-7-day-warning",
		async () => {
			const twentyThreeDaysAgo = new Date(
				Date.now() - 1000 * 60 * 60 * 24 * 23,
			);
			const users = await db
				.select()
				.from(opsUser)
				.where(
					and(
						lte(opsUser.markedForDeletionAt, twentyThreeDaysAgo),
						isNull(opsUser.finalWarningAt),
					),
				);

			console.log(
				`[UserDeletion] Found ${users.length} users for 7-day warning`,
			);
			if (users.length > 0) {
				console.log(
					"[UserDeletion] Users for 7-day warning:",
					users.map((u) => ({
						id: u.id,
						email: u.email,
						markedForDeletionAt: u.markedForDeletionAt?.toISOString(),
					})),
				);
			} else {
				console.log("[UserDeletion] No users found that need 7-day warnings");
			}
			return users;
		},
	);

	await context.run("send-7-day-warning", async () => {
		if (usersFor7DayWarning.length === 0) {
			console.log(
				"[UserDeletion] Skipping step 3: No users need 7-day warnings",
			);
			return;
		}

		console.log(
			`[UserDeletion] Processing ${usersFor7DayWarning.length} users for 7-day warnings`,
		);
		for (const user of usersFor7DayWarning) {
			try {
				// Get user details
				const { contactEmail, firstName } = await getUserDetails(user);

				console.log(
					`[UserDeletion] Sending 7-day warning to user ${user.id}, contact email: ${contactEmail}`,
				);

				// Send 7-day warning
				console.log(
					`[UserDeletion] Sending 7-day warning email to ${contactEmail} for user ${user.id}`,
				);
				const emailResult = await resend.emails.send({
					from: "Manage Team <noreply@email.managee.xyz>",
					to: contactEmail,
					subject: "Final Warning - Account Deletion in 7 Days",
					react: SevenDayWarning({
						firstName: firstName,
						email: contactEmail,
						// organizationName is undefined for user deletion
					}),
					text: sevenDayWarningPlainText({
						firstName: firstName,
						email: contactEmail,
						// organizationName is undefined for user deletion
					}),
				});
				console.log(
					`[UserDeletion] 7-day warning email result for user ${user.id}:`,
					JSON.stringify(emailResult, null, 2),
				);

				// Mark final warning sent
				await db
					.update(opsUser)
					.set({ finalWarningAt: new Date() })
					.where(eq(opsUser.id, user.id));

				console.log(
					`[UserDeletion] Successfully sent 7-day warning for user ${user.id} (${contactEmail})`,
				);
			} catch (error) {
				console.error(
					`[UserDeletion] Failed to send 7-day warning for user ${user.id}:`,
					error,
				);
			}
		}
	});

	// Step 4: Trigger deletion for users marked 30 days ago
	const usersToTriggerDeletion = await context.run(
		"fetch-users-to-trigger-deletion",
		async () => {
			const thirtyDaysAgoForDeletion = new Date(
				Date.now() - 1000 * 60 * 60 * 24 * 30,
			);
			const users = await db
				.select()
				.from(opsUser)
				.where(lte(opsUser.markedForDeletionAt, thirtyDaysAgoForDeletion));

			console.log(
				`[UserDeletion] Found ${users.length} users ready for deletion`,
			);
			if (users.length > 0) {
				console.log(
					"[UserDeletion] Users ready for deletion:",
					users.map((u) => ({
						id: u.id,
						email: u.email,
						markedForDeletionAt: u.markedForDeletionAt?.toISOString(),
						finalWarningAt: u.finalWarningAt?.toISOString(),
					})),
				);
			} else {
				console.log(
					"[UserDeletion] No users found that are ready for deletion",
				);
			}
			return users;
		},
	);

	await context.run("trigger-user-deletions", async () => {
		if (usersToTriggerDeletion.length === 0) {
			console.log(
				"[UserDeletion] Skipping step 4: No users ready for deletion",
			);
			return;
		}

		console.log(
			`[UserDeletion] Triggering deletion for ${usersToTriggerDeletion.length} users`,
		);
		for (const user of usersToTriggerDeletion) {
			console.log(
				`[UserDeletion] Triggering deletion for user ${user.id} (${user.email}) via Clerk API`,
			);

			// Delete user from Clerk, which will trigger the webhook
			// The webhook will handle database deletion and ops cleanup
			const clerk = await clerkClient();
			await clerk.users.deleteUser(user.id);

			console.log(
				`[UserDeletion] Successfully triggered deletion for user ${user.id} (${user.email}). Webhook will handle cleanup.`,
			);
		}
	});

	console.log(
		"[UserDeletion] User deletion job completed at",
		new Date().toISOString(),
	);
});

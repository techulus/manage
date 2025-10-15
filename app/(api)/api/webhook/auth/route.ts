import path from "node:path";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import type { NextRequest } from "next/server";
import { Resend } from "resend";
import {
	AccountDeleted,
	accountDeletedPlainText,
} from "@/components/emails/account-deleted";
import * as schema from "@/drizzle/schema";
import { SearchService } from "@/lib/search";
import {
	deleteDatabase,
	getDatabaseForOwner,
	getDatabaseName,
} from "@/lib/utils/useDatabase";
import { addUserToTenantDb } from "@/lib/utils/useUser";
import { triggerBlobDeletionWorkflow } from "@/lib/utils/workflow";
import { opsOrganization, opsUser } from "@/ops/drizzle/schema";
import { addUserToOpsDb, getOpsDatabase } from "@/ops/useOps";

type ClerkOrgData = {
	createdBy?: {
		email?: string;
		firstName?: string;
		lastName?: string;
	};
	adminEmails?: string[];
};

enum WebhookEventType {
	organizationCreated = "organization.created",
	organizationDeleted = "organization.deleted",
	organizationUpdated = "organization.updated",
	organizationInvitationAccepted = "organizationInvitation.accepted",
	userCreated = "user.created",
	userDeleted = "user.deleted",
	userUpdated = "user.updated",
}

async function createTenantDatabase(ownerId: string): Promise<void> {
	const databaseName = getDatabaseName(ownerId).match(
		(value) => value,
		() => {
			throw new Error("Database name not found");
		},
	);

	const sslMode = process.env.DATABASE_SSL === "true" ? "?sslmode=require" : "";

	const ownerDb = drizzle(`${process.env.DATABASE_URL}/manage${sslMode}`, {
		schema,
	});

	const checkDb = await ownerDb.execute(
		sql`SELECT 1 FROM pg_database WHERE datname = ${databaseName}`,
	);

	if (checkDb.rowCount === 0) {
		await ownerDb.execute(sql`CREATE DATABASE ${sql.identifier(databaseName)}`);
		console.log(`Created database for tenant: ${databaseName}`);
	}

	const tenantDb = drizzle(
		`${process.env.DATABASE_URL}/${databaseName}${sslMode}`,
		{ schema },
	);

	const migrationsFolder = path.resolve(process.cwd(), "drizzle");
	await migrate(tenantDb, { migrationsFolder });
	console.log(`Migrated database for tenant: ${databaseName}`);
}

export async function POST(req: NextRequest) {
	try {
		const evt = await verifyWebhook(req);

		const { id } = evt.data;
		const eventType = evt.type;
		console.log("Webhook payload:", id, evt.data);

		if (!id) {
			console.error("Webhook received with no ID");
			return new Response("Webhook received with no ID", { status: 400 });
		}

		switch (eventType) {
			case WebhookEventType.userCreated:
				try {
					const userData = evt.data;
					await createTenantDatabase(id);
					await Promise.all([
						addUserToTenantDb(userData),
						addUserToOpsDb(userData),
					]);
					console.log("User created - database and data synced successfully");
				} catch (err) {
					console.error("Error creating user and database:", err);
				}
				break;
			case WebhookEventType.userUpdated:
				try {
					const userData = evt.data;
					await Promise.all([
						addUserToTenantDb(userData),
						addUserToOpsDb(userData),
					]);
					console.log("User updated - data synced successfully");
				} catch (err) {
					console.error("Error syncing user data:", err);
				}
				break;
			case WebhookEventType.organizationCreated:
				try {
					const orgData = evt.data;
					await createTenantDatabase(id);
					const db = await getOpsDatabase();
					await db
						.insert(opsOrganization)
						.values({
							id: orgData.id,
							name: orgData.name,
							rawData: orgData,
							lastActiveAt: new Date(),
						})
						.execute();

					if (orgData.created_by) {
						try {
							const creatorData = await db
								.select()
								.from(opsUser)
								.where(eq(opsUser.id, orgData.created_by))
								.limit(1);

							if (creatorData.length > 0) {
								const creator = creatorData[0];
								const orgDb = await getDatabaseForOwner(id);
								await orgDb
									.insert(schema.user)
									.values({
										id: creator.id,
										email: creator.email,
										firstName: creator.firstName,
										lastName: creator.lastName,
										imageUrl: creator.imageUrl,
										rawData: creator.rawData,
										lastActiveAt: new Date(),
									})
									.onConflictDoUpdate({
										target: schema.user.id,
										set: {
											email: creator.email,
											firstName: creator.firstName,
											lastName: creator.lastName,
											imageUrl: creator.imageUrl,
											rawData: creator.rawData,
											lastActiveAt: new Date(),
										},
									})
									.execute();
								console.log(
									`Added creator ${creator.id} to organization database`,
								);
							}
						} catch (creatorErr) {
							console.error(
								"Error adding creator to org database:",
								creatorErr,
							);
						}
					}

					console.log(
						"Organization created - database and data synced successfully",
					);
				} catch (err) {
					console.error("Error creating organization and database:", err);
				}
				break;
			case WebhookEventType.organizationUpdated:
				try {
					const orgData = evt.data;
					const db = await getOpsDatabase();
					await db
						.insert(opsOrganization)
						.values({
							id: orgData.id,
							name: orgData.name,
							rawData: orgData,
							lastActiveAt: new Date(),
						})
						.onConflictDoUpdate({
							target: opsOrganization.id,
							set: {
								name: orgData.name,
								rawData: orgData,
								lastActiveAt: new Date(),
								markedForDeletionAt: null,
								finalWarningAt: null,
							},
						})
						.execute();
					console.log("Organization updated - data synced successfully");
				} catch (err) {
					console.error("Error syncing org data:", err);
				}
				break;
			case WebhookEventType.organizationInvitationAccepted:
				try {
					const invitationData = evt.data;
					const orgId = invitationData.organization_id;
					const emailAddress = invitationData.email_address;

					if (!orgId || !emailAddress) {
						console.error("Missing organization or email in invitation data");
						break;
					}

					const db = await getOpsDatabase();
					const userData = await db
						.select()
						.from(opsUser)
						.where(eq(opsUser.email, emailAddress))
						.limit(1);

					if (userData.length > 0) {
						const user = userData[0];
						const orgDb = await getDatabaseForOwner(orgId);
						await orgDb
							.insert(schema.user)
							.values({
								id: user.id,
								email: user.email,
								firstName: user.firstName,
								lastName: user.lastName,
								imageUrl: user.imageUrl,
								rawData: user.rawData,
								lastActiveAt: new Date(),
							})
							.onConflictDoUpdate({
								target: schema.user.id,
								set: {
									email: user.email,
									firstName: user.firstName,
									lastName: user.lastName,
									imageUrl: user.imageUrl,
									rawData: user.rawData,
									lastActiveAt: new Date(),
								},
							})
							.execute();
						console.log(
							`Added user ${user.id} to organization ${orgId} database after invitation acceptance`,
						);
					}
				} catch (err) {
					console.error("Error adding user to org after invitation:", err);
				}
				break;
			case WebhookEventType.userDeleted:
				// For individual users, delete database immediately
				// This happens when a user without an organization deletes their account
				try {
					await deleteDatabase(id);
					console.log("User database deleted successfully");
				} catch (err) {
					console.error("Error deleting user database:", err);
				}

				// Delete search index for user
				try {
					const userSearch = new SearchService(id, "me");
					await userSearch.deleteTenantIndex();
					console.log("User search index deleted successfully");
				} catch (err) {
					console.error("Error deleting user search index:", err);
				}

				// Also delete user from ops database
				try {
					const db = await getOpsDatabase();
					await db.delete(opsUser).where(eq(opsUser.id, id));
					console.log("User deleted from ops database successfully");
				} catch (err) {
					console.error("Error deleting user from ops database:", err);
				}

				// Trigger blob deletion workflow
				try {
					await triggerBlobDeletionWorkflow(id);
					console.log("User blob deletion workflow triggered successfully");
				} catch (err) {
					console.error("Error triggering user blob deletion workflow:", err);
				}
				break;
			case WebhookEventType.organizationDeleted: {
				console.log(`[Webhook] Processing organization deletion for ID: ${id}`);

				// First, get the organization info from ops database for email
				let orgData = null;
				try {
					const db = await getOpsDatabase();
					const orgs = await db
						.select()
						.from(opsOrganization)
						.where(eq(opsOrganization.id, id));
					orgData = orgs[0];
					if (orgData) {
						console.log(
							`[Webhook] Found organization data for ${orgData.name} (${id})`,
						);
					}
				} catch (err) {
					console.error(
						`[Webhook] Error fetching organization data for ID: ${id}:`,
						err,
					);
				}

				// Delete organization database immediately when Clerk deletes the organization
				try {
					await deleteDatabase(id);
					console.log(
						`[Webhook] Organization database deleted successfully for ID: ${id}`,
					);
				} catch (err) {
					console.error(
						`[Webhook] Error deleting organization database for ID: ${id}:`,
						err,
					);
				}

				// Delete search index for organization
				try {
					const orgSearch = new SearchService(id, id); // slug is not relevant for deleting
					await orgSearch.deleteTenantIndex();
					console.log(
						`[Webhook] Organization search index deleted successfully for ID: ${id}`,
					);
				} catch (err) {
					console.error(
						`[Webhook] Error deleting organization search index for ID: ${id}:`,
						err,
					);
				}

				// Send deletion confirmation email if we have org data
				if (orgData) {
					try {
						const rawData = orgData.rawData as ClerkOrgData;
						const createdBy = rawData?.createdBy;
						const contactEmail = createdBy?.email || rawData?.adminEmails?.[0];

						if (contactEmail) {
							console.log(
								`[Webhook] Sending deletion confirmation email to ${contactEmail} for org ${orgData.name}`,
							);

							const resend = new Resend(process.env.RESEND_API_KEY);
							await resend.emails.send({
								from: "Manage Team <noreply@email.managee.xyz>",
								to: contactEmail,
								subject: "Organization Deleted",
								react: AccountDeleted({
									firstName: createdBy?.firstName || undefined,
									email: contactEmail,
									organizationName: orgData.name,
								}),
								text: accountDeletedPlainText({
									firstName: createdBy?.firstName || undefined,
									email: contactEmail,
									organizationName: orgData.name,
								}),
							});

							console.log(
								`[Webhook] Deletion confirmation email sent successfully for org ${orgData.name}`,
							);
						} else {
							console.log(
								`[Webhook] No contact email found for org ${orgData.name}, skipping deletion confirmation email`,
							);
						}
					} catch (emailErr) {
						console.error(
							`[Webhook] Error sending deletion confirmation email for ID: ${id}:`,
							emailErr,
						);
					}
				}

				// Delete organization from ops database
				try {
					const db = await getOpsDatabase();
					await db.delete(opsOrganization).where(eq(opsOrganization.id, id));
					console.log(
						`[Webhook] Organization deleted from ops database successfully for ID: ${id}`,
					);
				} catch (err) {
					console.error(
						`[Webhook] Error deleting organization from ops database for ID: ${id}:`,
						err,
					);
				}

				// Trigger blob deletion workflow
				try {
					await triggerBlobDeletionWorkflow(id);
					console.log(
						`[Webhook] Organization blob deletion workflow triggered successfully for ID: ${id}`,
					);
				} catch (err) {
					console.error(
						`[Webhook] Error triggering organization blob deletion workflow for ID: ${id}:`,
						err,
					);
				}
				break;
			}
			default:
				console.log("Unhandled webhook event type:", eventType);
				break;
		}

		return new Response("ok", { status: 200 });
	} catch (err) {
		console.error("Error verifying webhook:", err);
		return new Response("Error verifying webhook", { status: 400 });
	}
}

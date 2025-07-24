import path from "node:path";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { type NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schema from "./drizzle/schema";

export async function getOpsDatabase(): Promise<NodePgDatabase<typeof schema>> {
	const sslMode = process.env.DATABASE_SSL === "true" ? "?sslmode=require" : "";

	const ownerDb = drizzle(`${process.env.DATABASE_URL}/manage${sslMode}`, {
		schema,
	});

	const migrationsFolder = path.resolve(process.cwd(), "ops/drizzle");
	await migrate(ownerDb, { migrationsFolder: migrationsFolder });

	return ownerDb;
}

export async function addUserToOpsDb() {
	const { orgId } = await auth();
	const userData = await currentUser();
	if (!userData) {
		throw new Error("No user found");
	}
	if (!userData.emailAddresses || userData.emailAddresses.length === 0) {
		throw new Error("The user has no associated email addresses.");
	}

	const db = await getOpsDatabase();
	db.insert(schema.opsUser)
		.values({
			id: userData.id,
			email: userData.emailAddresses?.[0].emailAddress,
			firstName: userData.firstName,
			lastName: userData.lastName,
			imageUrl: userData.imageUrl,
			rawData: userData,
			lastActiveAt: new Date(),
		})
		.onConflictDoUpdate({
			target: schema.opsUser.id,
			set: {
				email: userData.emailAddresses?.[0].emailAddress,
				firstName: userData.firstName,
				lastName: userData.lastName,
				imageUrl: userData.imageUrl,
				rawData: userData,
				lastActiveAt: new Date(),
			},
		})
		.execute();

	if (orgId) {
		const clerk = await clerkClient();
		const organization = await clerk.organizations.getOrganization({
			organizationId: orgId,
		});
		db.insert(schema.opsOrganization)
			.values({
				id: organization.id,
				name: organization.name,
				rawData: organization,
				lastActiveAt: new Date(),
			})
			.onConflictDoUpdate({
				target: schema.opsOrganization.id,
				set: {
					name: organization.name,
					rawData: organization,
					lastActiveAt: new Date(),
					markedForDeletionAt: null,
					finalWarningAt: null,
				},
			})
			.execute();
		console.log("org added to ops database");
	}
}

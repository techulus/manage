import { logtoConfig } from "@/app/logto";
import { user } from "@/drizzle/schema";
import { database } from "@/lib/utils/useDatabase";
import { getLogtoContext } from "@logto/next/server-actions";

export async function setupOrganisation() {
	// const { manage } = await getLogtoContext(logtoConfig);
}

export async function addUserToTenantDb() {
	const { claims } = await getLogtoContext(logtoConfig);
	if (!claims?.sub) {
		throw new Error("User not found");
	}
	const id = claims.sub;

	const db = await database();
	db.insert(user)
		.values({
			id,
			email: "",
			rawData: "",
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.onConflictDoNothing()
		.run();
}

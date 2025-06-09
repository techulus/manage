import { opsUser } from "@/ops/drizzle/schema";
import { getOpsDatabase } from "@/ops/useOps";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET() {
	const clerk = await clerkClient();

	const db = await getOpsDatabase();

	const users = await clerk.users.getUserList({
		limit: 100,
	});
	for (const userData of users.data) {
		console.log("inserting user", userData.id);
		await db
			.insert(opsUser)
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
				target: opsUser.id,
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
	}

	return new Response("ok", { status: 200 });
}

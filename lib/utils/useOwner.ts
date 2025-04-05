import { user } from "@/drizzle/schema";
import type { User } from "@/drizzle/types";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { database } from "./useDatabase";

type Result = {
	ownerId: string;
	userId: string;
	orgId: string | null;
	orgSlug: string;
};

export async function getUser(): Promise<User> {
	const userData = await currentUser();
	if (!userData) {
		console.warn("No session, redirecting to sign-in");
		redirect("/sign-in");
	}

	const db = await database();
	const userDetails = await db.query.user.findFirst({
		where: eq(user.id, userData.id),
	});

	if (!userDetails) {
		throw new Error("User not found");
	}

	return userDetails;
}

export async function getOwner(): Promise<Result> {
	const { userId, orgId, orgSlug } = await auth();
	if (!userId) {
		console.warn("No session, redirecting to sign-in");
		redirect("/sign-in");
	}

	return {
		ownerId: orgId ?? userId,
		userId,
		orgId,
		orgSlug: orgSlug ?? "me",
	} as Result;
}

export async function getTimezone() {
	const cookieStore = await cookies();
	return (
		cookieStore.get("userTimezone")?.value ??
		Intl.DateTimeFormat().resolvedOptions().timeZone
	);
}

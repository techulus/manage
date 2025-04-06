import { database } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { auth } from "@clerk/nextjs/server";
import { TRPCError, initTRPC } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";

export const createTRPCContext = cache(async () => {
	/**
	 * @see: https://trpc.io/docs/server/context
	 */
	const { sessionId } = await auth();
	if (!sessionId) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
		});
	}

	const { orgSlug, ownerId, orgId, userId } = await getOwner();
	const db = await database();

	return {
		sessionId,
		userId,
		orgId,
		orgSlug,
		ownerId,
		db,
	};
});

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.

const t = initTRPC.context<Context>().create({
	/**
	 * @see https://trpc.io/docs/server/data-transformers
	 */
	transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

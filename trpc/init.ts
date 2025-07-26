import { SearchService } from "@/lib/search";
import { database } from "@/lib/utils/useDatabase";
import { getOwner, getTimezone } from "@/lib/utils/useOwner";
import { auth } from "@clerk/nextjs/server";
import { TRPCError, initTRPC } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";
import { ZodError } from "zod";

export const createTRPCContext = cache(async () => {
	/**
	 * @see: https://trpc.io/docs/server/context
	 */
	return {
		timezone: await getTimezone(),
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
	jsonl: {
		pingMs: 1000,
	},
	transformer: superjson,
	errorFormatter(opts) {
		const { shape, error } = opts;
		return {
			...shape,
			data: {
				...shape.data,
				zodError:
					error.code === "BAD_REQUEST" && error.cause instanceof ZodError
						? error.cause.flatten()
						: null,
			},
		};
	},
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ next }) => {
	const { sessionId } = await auth();
	if (!sessionId) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	const { orgSlug, ownerId, orgId, userId } = await getOwner();
	const db = await database();
	const search = new SearchService(ownerId, orgSlug);

	return next({
		ctx: {
			sessionId,
			userId,
			orgId,
			orgSlug,
			ownerId,
			db,
			search,
		},
	});
});

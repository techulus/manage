import { auth } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { database } from "@/lib/utils/useDatabase";
import { getOwner, getTimezone } from "@/lib/utils/useOwner";

export const createTRPCContext = async () => {
	const timezone = await getTimezone();
	const { orgSlug, ownerId } = await getOwner();
	const db = await database();

	return {
		timezone,
		db,
		ownerId,
		orgSlug,
	};
};

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
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
	const { sessionId, has } = await auth();
	if (!sessionId) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	const { orgId, userId } = await getOwner();

	const isOrgAdmin = !orgId ? true : has({ role: "org:admin" });

	return next({
		ctx: {
			...ctx,
			sessionId,
			userId,
			orgId,
			isOrgAdmin,
		},
	});
});

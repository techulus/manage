import { initTRPC, TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import superjson from "superjson";
import { ZodError } from "zod";
import { member } from "@/drizzle/schema";
import { auth } from "@/lib/auth";
import { database } from "@/lib/utils/useDatabase";
import { getOwner, getTimezone } from "@/lib/utils/useOwner";

export const createTRPCContext = async () => {
	const timezone = await getTimezone();
	const { orgSlug } = await getOwner();
	const db = database();

	return {
		timezone,
		db,
		orgSlug,
	};
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
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
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	const { orgId, userId } = await getOwner();

	let isOrgAdmin = true;
	if (orgId) {
		const membership = await ctx.db.query.member.findFirst({
			where: and(eq(member.organizationId, orgId), eq(member.userId, userId)),
		});
		isOrgAdmin = membership?.role === "owner" || membership?.role === "admin";
	}

	return next({
		ctx: {
			...ctx,
			sessionId: session.session.id,
			userId,
			orgId,
			isOrgAdmin,
		},
	});
});

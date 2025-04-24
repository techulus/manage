import { createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const handler = (req: Request) =>
	fetchRequestHandler({
		endpoint: "/api/trpc",
		req,
		router: appRouter,
		createContext: createTRPCContext,
		allowMethodOverride: true,
	});

export const POST = handler;

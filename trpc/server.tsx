import "server-only"; // <-- ensure this file cannot be imported from the client
import { httpLink } from "@trpc/client";
import { createTRPCClient } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { cache } from "react";
import { createCallerFactory, createTRPCContext } from "./init";
import { makeQueryClient } from "./query-client";
import { appRouter } from "./routers/_app";

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const getQueryClient = cache(makeQueryClient);
export const trpc = createTRPCOptionsProxy({
	ctx: createTRPCContext,
	router: appRouter,
	queryClient: getQueryClient,
});

createTRPCOptionsProxy({
	client: createTRPCClient({
		links: [httpLink({ url: `${process.env.NEXT_PUBLIC_APP_URL}/api/trpc` })],
	}),
	queryClient: getQueryClient,
});

export const caller = createCallerFactory(appRouter)(createTRPCContext);

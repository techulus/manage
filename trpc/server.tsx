import { createCallerFactory, createTRPCContext } from "./init";
import { appRouter } from "./routers/_app";

export const caller = createCallerFactory(appRouter)(createTRPCContext);

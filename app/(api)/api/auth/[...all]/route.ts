import { auth } from "@/lib/betterauth/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler((request) =>
	auth().handler(request),
);

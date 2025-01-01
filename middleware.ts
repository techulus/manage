import { getLogtoContext } from "@logto/next/server-actions";
import { type NextRequest, NextResponse } from "next/server";
import { logtoConfig } from "./app/logto";

const publicAppPaths = [
	"/sign-in",
	"/terms",
	"/webhooks",
	"/api/auth",
	"/api/calendar",
	"/callback",
];

export async function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;

	const { isAuthenticated } = await getLogtoContext(logtoConfig);
	if (isAuthenticated && pathname === "/sign-in") {
		return NextResponse.redirect(new URL("/start", req.nextUrl.href));
	}

	const isPublicAppPath = publicAppPaths.some((path) =>
		pathname.startsWith(path),
	);
	if (isPublicAppPath || pathname === "/") {
		return NextResponse.next();
	}

	if (!isAuthenticated) {
		return NextResponse.redirect(
			new URL(
				`/sign-in?redirectTo=${encodeURIComponent(req.nextUrl.href)}`,
				req.url,
			),
		);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

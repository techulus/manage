import { type NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const publicAppPaths = [
	"/sign-in",
	"/sign-up",
	"/terms",
	"/webhooks",
	"/api/auth",
	"/api/calendar",
	"/callback",
];

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	const isPublicAppPath = publicAppPaths.some((path) =>
		pathname.startsWith(path),
	);
	if (isPublicAppPath || pathname === "/") {
		return NextResponse.next();
	}

	const session = getSessionCookie(request);
	if (session && pathname === "/sign-in") {
		return NextResponse.redirect(new URL("/start", request.nextUrl.href));
	}

	if (!session) {
		return NextResponse.redirect(
			new URL(
				`/sign-in?redirectTo=${encodeURIComponent(request.nextUrl.href)}`,
				request.url,
			),
		);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

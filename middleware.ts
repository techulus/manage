import { getSessionCookie } from "better-auth";
import { type NextRequest, NextResponse } from "next/server";

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

	const session = getSessionCookie(request);

	if (session && (pathname === "/sign-in" || pathname === "/sign-up")) {
		return NextResponse.redirect(new URL("/start", request.nextUrl.href));
	}

	const isPublicAppPath = publicAppPaths.some((path) =>
		pathname.startsWith(path),
	);
	if (isPublicAppPath || pathname === "/") {
		return NextResponse.next();
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

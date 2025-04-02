import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

const publicAppPaths = [
	"/sign-in",
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
	if (!session) {
		return NextResponse.redirect(
			new URL(
				`/sign-in?redirectTo=${encodeURIComponent(request.nextUrl.pathname)}`,
				request.url,
			),
		);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

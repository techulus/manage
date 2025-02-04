import { type NextRequest, NextResponse } from "next/server";
import type { auth } from "./lib/auth";

type Session = typeof auth.$Infer.Session;

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

	const session: Session = await fetch(
		`${request.nextUrl.origin}/api/auth/get-session`,
		{
			headers: {
				cookie: request.headers.get("cookie") || "",
			},
		},
	).then((res) => res.json());

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

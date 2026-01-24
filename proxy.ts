import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const publicRoutes = [
	"/",
	"/sign-in",
	"/terms",
	"/privacy",
	"/api/auth",
	"/api/webhook",
	"/api/jobs",
	"/api/calendar",
	"/callback",
];

function isPublicRoute(pathname: string): boolean {
	return publicRoutes.some(
		(route) => pathname === route || pathname.startsWith(`${route}/`),
	);
}

export async function proxy(req: NextRequest) {
	const pathname = req.nextUrl.pathname;

	if (isPublicRoute(pathname)) {
		return NextResponse.next();
	}

	const session = await auth.api.getSession({
		headers: req.headers,
	});

	if (!session) {
		const signInUrl = new URL("/sign-in", req.url);
		signInUrl.searchParams.set("redirect", pathname);
		return NextResponse.redirect(signInUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		"/(api|trpc)(.*)",
	],
};

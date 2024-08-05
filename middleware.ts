import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "./auth";
import { opsDb } from "./ops/database";
import { organizations } from "./ops/schema";

const publicAppPaths = [
	"/sign-in",
	"/terms",
	"/webhooks",
	"/api/trigger",
	"/api/auth",
	"/api/calendar",
];

export default auth(async (req) => {
	const pathname = req.nextUrl.pathname;

	const isPublicAppPath = publicAppPaths.some((path) =>
		pathname.startsWith(path),
	);
	if (isPublicAppPath || pathname === "/") {
		return NextResponse.next();
	}

	if (!req.auth) {
		return NextResponse.redirect(
			new URL(
				`/sign-in?redirectTo=${encodeURIComponent(req.nextUrl.href)}`,
				req.url,
			),
		);
	}

	const activeOrgSlug = req.cookies.get("activeOrgSlug")?.value;
	const currentOrgSlug = req.nextUrl.pathname.split("/")?.[1];
	if (currentOrgSlug !== activeOrgSlug) {
		const org = await opsDb().query.organizations.findFirst({
			where: eq(organizations.slug, currentOrgSlug),
		});
		if (org) {
			const response = NextResponse.redirect(req.nextUrl.clone());
			response.cookies.set("activeOrgId", org.id);
			response.cookies.set("activeOrgSlug", org.slug);
			return response;
		}
	}

	if (pathname === "/sign-in") {
		return NextResponse.redirect(new URL("/start", req.nextUrl.href));
	}

	return NextResponse.next();
});

export const config = {
	matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

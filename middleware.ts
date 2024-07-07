import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in",
  "/sign-up",
  "/terms",
  "/webhooks/(.*)",
  "/api/trigger",
]);

export default clerkMiddleware(
  (auth, req) => {
    if (!isPublicRoute(req)) auth().protect();
  },
  {
    debug: false,
  }
);

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

import { withSentryConfig } from "@sentry/nextjs";

const nextConfig = {
	rewrites: async () => {
		return [
			{
				source: "/api/calendar/:ownerId/:projectId/calendar.ics",
				destination: "/api/calendar/:ownerId/:projectId",
			},
			{
				source: "/ingest/static/:path*",
				destination: "https://us-assets.i.posthog.com/static/:path*",
			},
			{
				source: "/ingest/:path*",
				destination: "https://us.i.posthog.com/:path*",
			},
			{
				source: "/ingest/decide",
				destination: "https://us.i.posthog.com/decide",
			},
		];
	},

	// This is required to support PostHog trailing slash API requests
	skipTrailingSlashRedirect: true,

	output: "standalone", // Uncomment this to enable standalone mode in Docker
};

const config = withSentryConfig(nextConfig, {
	org: process.env.SENTRY_ORG,
	project: process.env.SENTRY_PROJECT,

	// Only print logs for uploading source maps in CI
	silent: !process.env.CI,

	// For all available options, see:
	// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

	// Upload a larger set of source maps for prettier stack traces (increases build time)
	widenClientFileUpload: true,

	// Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
	// This can increase your server load as well as your hosting bill.
	// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
	// side errors will fail.
	tunnelRoute: "/monitoring",
	disableLogger: true,
	automaticVercelMonitors: false,
});

export default config;

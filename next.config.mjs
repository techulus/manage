import { withSentryConfig } from "@sentry/nextjs";

const nextConfig = {
	rewrites: async () => {
		return [
			{
				source: "/api/calendar/:ownerId/:projectId/calendar.ics",
				destination: "/api/calendar/:ownerId/:projectId",
			},
		];
	},
	output: "standalone",
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

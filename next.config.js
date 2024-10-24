/** @type {import('next').NextConfig} */
const nextConfig = {
	rewrites: async () => {
		return [
			{
				source: "/api/calendar/:ownerId/:projectId/calendar.ics",
				destination: "/api/calendar/:ownerId/:projectId",
			},
		];
	},
	serverExternalPackages: ["@libsql"],
};

module.exports = nextConfig;

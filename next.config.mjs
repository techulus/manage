const nextConfig = {
	typedRoutes: false,
	reactCompiler: true,

	rewrites: async () => {
		return [
			{
				source: "/api/calendar/:ownerId/:projectId/calendar.ics",
				destination: "/api/calendar/:ownerId/:projectId",
			},
		];
	},
};

export default nextConfig;

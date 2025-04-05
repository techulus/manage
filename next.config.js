/** @type {import('next').NextConfig} */
module.exports = {
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

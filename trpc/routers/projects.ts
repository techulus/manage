import { document, project, taskList } from "@/drizzle/schema";
import type { ProjectWithData } from "@/drizzle/types";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";

export const projectsRouter = createTRPCRouter({
	getProjectById: baseProcedure
		.input(
			z.object({
				id: z.number(),
				withTasksAndDocs: z.boolean().optional().default(false),
			}),
		)
		.query(async ({ ctx, input }) => {
			const data = await ctx.db.query.project
				.findFirst({
					where: and(eq(project.id, input.id)),
					with: input.withTasksAndDocs
						? {
								taskLists: {
									where: eq(taskList.status, "active"),
									with: {
										tasks: true,
									},
								},
								documents: {
									columns: {
										id: true,
										name: true,
									},
									where: isNull(document.folderId),
									with: {
										creator: {
											columns: {
												firstName: true,
												imageUrl: true,
											},
										},
									},
								},
								documentFolders: {
									with: {
										creator: {
											columns: {
												firstName: true,
												imageUrl: true,
											},
										},
										// I can't get count query to work, so I'm just selecting the id :(
										documents: {
											columns: {
												id: true,
											},
										},
										files: {
											columns: {
												id: true,
											},
										},
									},
								},
							}
						: {},
				})
				.execute();

			if (!data) {
				throw new Error(`Project with id ${input.id} not found`);
			}

			return data as ProjectWithData;
		}),
});

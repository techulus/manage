"use server";

import { calendarEvent, document, project, taskList } from "@/drizzle/schema";
import type { ProjectWithCreator, ProjectWithData } from "@/drizzle/types";
import { and, between, eq, isNotNull, isNull, like, or } from "drizzle-orm";
import { toEndOfDay, toStartOfDay } from "./date";
import { database } from "./useDatabase";

export async function getProjectsForOwner({
	search,
	statuses = ["active"],
}: {
	search?: string;
	statuses?: string[];
}): Promise<{
	projects: ProjectWithCreator[];
	archivedProjects: ProjectWithCreator[];
}> {
	const db = await database();

	const statusFilter = statuses?.map((status) => eq(project.status, status));

	const projects = await db.query.project.findMany({
		where: search
			? and(like(project.name, `%${search}%`), or(...statusFilter))
			: and(or(...statusFilter)),
		with: {
			creator: true,
		},
	});

	const archivedProjects = await db.query.project.findMany({
		where: search
			? and(eq(project.status, "archived"), like(project.name, `%${search}%`))
			: and(eq(project.status, "archived")),
		with: {
			creator: true,
		},
	});

	return { projects, archivedProjects };
}

export async function getProjectById(
	projectId: string | number,
	withTasksAndDocs = false,
): Promise<ProjectWithData> {
	if (Number.isNaN(+projectId)) {
		throw new Error(`Invalid project id: ${projectId}`);
	}

	const db = await database();

	const startOfDay = toStartOfDay(new Date());
	const endOfDay = toEndOfDay(new Date());

	const data = await db.query.project
		.findFirst({
			where: and(eq(project.id, +projectId)),
			with: withTasksAndDocs
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
						events: {
							where: or(
								between(calendarEvent.start, startOfDay, endOfDay),
								between(calendarEvent.end, startOfDay, endOfDay),
								isNotNull(calendarEvent.repeatRule),
							),
							with: {
								creator: {
									columns: {
										id: true,
										firstName: true,
										imageUrl: true,
									},
								},
								invites: {
									with: {
										user: {
											columns: {
												firstName: true,
												imageUrl: true,
											},
										},
									},
								},
							},
						},
					}
				: {},
		})
		.execute();

	if (!data) {
		throw new Error(`Project with id ${projectId} not found`);
	}

	return data as ProjectWithData;
}

export async function getTaskListById(taskListId: string | number) {
	const db = await database();
	const data = await db.query.taskList
		.findFirst({
			where: eq(taskList.id, +taskListId),
		})
		.execute();

	if (!data) {
		throw new Error(`TaskList with id ${taskListId} not found`);
	}

	return data;
}

export async function getDocumentById(documentId: string | number) {
	const db = await database();
	const data = await db.query.document
		.findFirst({
			where: eq(document.id, +documentId),
		})
		.execute();

	if (!data) {
		throw new Error(`Document with id ${documentId} not found`);
	}

	return data;
}

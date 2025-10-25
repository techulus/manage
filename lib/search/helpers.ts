import {
	type calendarEvent,
	post,
	project,
	type task,
	taskList,
} from "@/drizzle/schema";
import type { Database } from "@/drizzle/types";
import { runAndLogError } from "@/lib/error";
import type { SearchService } from "@/lib/search";
import { eq } from "drizzle-orm";

export async function getProjectForIndexing(
	db: Database,
	projectId: number,
): Promise<typeof project.$inferSelect | undefined> {
	return await db.query.project.findFirst({
		where: eq(project.id, projectId),
	});
}

export async function getTaskListWithProject(
	db: Database,
	taskListId: number,
): Promise<
	| (typeof taskList.$inferSelect & { project: typeof project.$inferSelect })
	| undefined
> {
	const result = await db.query.taskList.findFirst({
		where: eq(taskList.id, taskListId),
		with: { project: true },
	});

	if (!result?.project) return undefined;
	return result as typeof taskList.$inferSelect & {
		project: typeof project.$inferSelect;
	};
}

export async function indexProject(
	search: SearchService,
	projectData: typeof project.$inferSelect,
) {
	await runAndLogError("indexing project for search", async () => {
		await search.indexProject(projectData);
	});
}

export async function indexTaskList(
	search: SearchService,
	taskListData: typeof taskList.$inferSelect,
	projectData: typeof project.$inferSelect,
) {
	await runAndLogError("indexing task list for search", async () => {
		await search.indexTaskList(taskListData, projectData);
	});
}

export async function indexTaskListWithProjectFetch(
	db: Database,
	search: SearchService,
	taskListData: typeof taskList.$inferSelect,
) {
	await runAndLogError("indexing task list for search", async () => {
		const projectData = await getProjectForIndexing(db, taskListData.projectId);
		if (projectData) {
			await search.indexTaskList(taskListData, projectData);
		}
	});
}

export async function indexTask(
	search: SearchService,
	taskData: typeof task.$inferSelect,
	taskListData: typeof taskList.$inferSelect,
	projectData: typeof project.$inferSelect,
) {
	await runAndLogError("indexing task for search", async () => {
		await search.indexTask(taskData, taskListData, projectData);
	});
}

export async function indexTaskWithDataFetch(
	db: Database,
	search: SearchService,
	taskData: typeof task.$inferSelect,
) {
	await runAndLogError("indexing task for search", async () => {
		const taskListWithProject = await getTaskListWithProject(
			db,
			taskData.taskListId,
		);
		if (taskListWithProject) {
			await search.indexTask(
				taskData,
				taskListWithProject,
				taskListWithProject.project,
			);
		}
	});
}

export async function indexEvent(
	search: SearchService,
	eventData: typeof calendarEvent.$inferSelect,
	projectData: typeof project.$inferSelect,
) {
	await runAndLogError("indexing event for search", async () => {
		await search.indexEvent(eventData, projectData);
	});
}

export async function deleteSearchItem(
	search: SearchService,
	itemId: string,
	itemType: string,
) {
	await runAndLogError(`removing ${itemType} from search index`, async () => {
		await search.deleteItem(itemId);
	});
}

export async function deleteProjectSearchItems(
	search: SearchService,
	projectId: number,
) {
	await runAndLogError(
		"removing project-related content from search index",
		async () => {
			await search.deleteByProject(projectId);
		},
	);
}

export async function indexEventWithProjectFetch(
	db: Database,
	search: SearchService,
	eventData: typeof calendarEvent.$inferSelect,
) {
	await runAndLogError("indexing event for search", async () => {
		const projectData = await getProjectForIndexing(db, eventData.projectId);
		if (projectData) {
			await search.indexEvent(eventData, projectData);
		}
	});
}

export async function indexPost(
	search: SearchService,
	postData: typeof post.$inferSelect,
	projectData: typeof project.$inferSelect,
) {
	await runAndLogError("indexing post for search", async () => {
		await search.indexPost(postData, projectData);
	});
}

export async function indexPostWithProjectFetch(
	db: Database,
	search: SearchService,
	postData: typeof post.$inferSelect,
) {
	await runAndLogError("indexing post for search", async () => {
		const projectData = await getProjectForIndexing(db, postData.projectId);
		if (projectData) {
			await search.indexPost(postData, projectData);
		}
	});
}

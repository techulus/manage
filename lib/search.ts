import type { calendarEvent, project, task, taskList } from "@/drizzle/schema";
import { Search } from "@upstash/search";

const client = Search.fromEnv();

export interface SearchableItem {
	id: string;
	type: "project" | "task" | "tasklist" | "event";
	title: string;
	description?: string;
	projectId?: number;
	projectName?: string;
	url: string;
	createdAt: Date;
	dueDate?: Date;
	status?: string;
	metadata?: Record<string, unknown>;
}

export class SearchService {
	private index: ReturnType<typeof client.index>;
	private tenant: string;
	private orgSlug: string;

	constructor(tenant: string, orgSlug: string) {
		if (!tenant) {
			throw new Error("Tenant ID is required for SearchService");
		}
		if (!orgSlug) {
			throw new Error("Organization slug is required for SearchService");
		}
		this.tenant = tenant;
		this.orgSlug = orgSlug;
		this.index = client.index(`manage-${tenant}`);
	}

	async indexProject(projectData: typeof project.$inferSelect) {
		const index = this.index;
		const searchableItem: SearchableItem = {
			id: `project-${projectData.id}`,
			type: "project",
			title: projectData.name,
			description: projectData.description || undefined,
			projectId: projectData.id,
			url: `/${this.orgSlug}/projects/${projectData.id}`,
			createdAt: projectData.createdAt,
			dueDate: projectData.dueDate || undefined,
			status: projectData.status,
			metadata: {
				createdByUser: projectData.createdByUser,
			},
		};

		await index.upsert({
			id: searchableItem.id,
			content: {
				title: searchableItem.title,
				description: searchableItem.description || "",
				type: searchableItem.type,
				status: searchableItem.status || "",
				projectId: searchableItem.projectId,
			},
			metadata: {
				url: searchableItem.url,
				createdAt: searchableItem.createdAt.toISOString(),
				dueDate: searchableItem.dueDate?.toISOString(),
				createdByUser: searchableItem.metadata?.createdByUser,
			},
		});
	}

	async indexTask(
		taskData: typeof task.$inferSelect,
		taskListData: typeof taskList.$inferSelect,
		projectData: typeof project.$inferSelect,
	) {
		const index = this.index;
		const searchableItem: SearchableItem = {
			id: `task-${taskData.id}`,
			type: "task",
			title: taskData.name,
			description: taskData.description || undefined,
			projectId: projectData.id,
			projectName: projectData.name,
			url: `/${this.orgSlug}/projects/${projectData.id}/tasklists/${taskListData.id}?task=${taskData.id}`,
			createdAt: taskData.createdAt,
			dueDate: taskData.dueDate || undefined,
			status: taskData.status,
			metadata: {
				taskListId: taskData.taskListId,
				taskListName: taskListData.name,
				projectName: projectData.name,
				createdByUser: taskData.createdByUser,
				assignedToUser: taskData.assignedToUser,
			},
		};

		await index.upsert({
			id: searchableItem.id,
			content: {
				title: searchableItem.title,
				description: searchableItem.description || "",
				type: searchableItem.type,
				status: searchableItem.status || "",
				projectName: searchableItem.projectName || "",
				projectId: searchableItem.projectId,
			},
			metadata: {
				url: searchableItem.url,
				createdAt: searchableItem.createdAt.toISOString(),
				dueDate: searchableItem.dueDate?.toISOString(),
				taskListId: searchableItem.metadata?.taskListId,
				taskListName: searchableItem.metadata?.taskListName,
				createdByUser: searchableItem.metadata?.createdByUser,
				assignedToUser: searchableItem.metadata?.assignedToUser,
			},
		});
	}

	async indexTaskList(
		taskListData: typeof taskList.$inferSelect,
		projectData: typeof project.$inferSelect,
	) {
		const index = this.index;
		const searchableItem: SearchableItem = {
			id: `tasklist-${taskListData.id}`,
			type: "tasklist",
			title: taskListData.name,
			description: taskListData.description || undefined,
			projectId: projectData.id,
			projectName: projectData.name,
			url: `/${this.orgSlug}/projects/${projectData.id}/tasklists/${taskListData.id}`,
			createdAt: taskListData.createdAt,
			dueDate: taskListData.dueDate || undefined,
			status: taskListData.status,
			metadata: {
				projectName: projectData.name,
				createdByUser: taskListData.createdByUser,
			},
		};

		await index.upsert({
			id: searchableItem.id,
			content: {
				title: searchableItem.title,
				description: searchableItem.description || "",
				type: searchableItem.type,
				status: searchableItem.status || "",
				projectName: searchableItem.projectName || "",
				projectId: searchableItem.projectId,
			},
			metadata: {
				url: searchableItem.url,
				createdAt: searchableItem.createdAt.toISOString(),
				dueDate: searchableItem.dueDate?.toISOString(),
				createdByUser: searchableItem.metadata?.createdByUser,
			},
		});
	}

	async indexEvent(
		eventData: typeof calendarEvent.$inferSelect,
		projectData: typeof project.$inferSelect,
	) {
		const index = this.index;
		const searchableItem: SearchableItem = {
			id: `event-${eventData.id}`,
			type: "event",
			title: eventData.name,
			description: eventData.description || undefined,
			projectId: projectData.id,
			projectName: projectData.name,
			url: `/${this.orgSlug}/projects/${projectData.id}/events?event=${eventData.id}`,
			createdAt: eventData.createdAt,
			metadata: {
				projectName: projectData.name,
				start: eventData.start.toISOString(),
				end: eventData.end?.toISOString(),
				allDay: eventData.allDay,
				createdByUser: eventData.createdByUser,
			},
		};

		await index.upsert({
			id: searchableItem.id,
			content: {
				title: searchableItem.title,
				description: searchableItem.description || "",
				type: searchableItem.type,
				projectName: searchableItem.projectName || "",
				projectId: searchableItem.projectId,
			},
			metadata: {
				url: searchableItem.url,
				createdAt: searchableItem.createdAt.toISOString(),
				start: searchableItem.metadata?.start,
				end: searchableItem.metadata?.end,
				allDay: searchableItem.metadata?.allDay,
				createdByUser: searchableItem.metadata?.createdByUser,
			},
		});
	}

	async search(
		query: string,
		options?: {
			type?: "project" | "task" | "tasklist" | "event";
			projectId?: number;
			limit?: number;
		},
	) {
		const searchOptions: {
			query: string;
			limit: number;
			reranking: boolean;
			filter?: string;
		} = {
			query,
			limit: options?.limit || 20,
			reranking: true,
		};

		const filters: string[] = [];

		if (options?.type) {
			filters.push(`type = '${options.type}'`);
		}

		if (options?.projectId) {
			filters.push(`projectId = ${options.projectId}`);
		}

		if (filters.length > 0) {
			searchOptions.filter = filters.join(" AND ");
		}

		const results = await this.index.search(searchOptions);

		return results.map(
			(result: {
				id: string;
				score: number;
				content?: {
					title?: string;
					description?: string;
					type?: string;
					status?: string;
					projectName?: string;
					projectId?: number;
				};
				metadata?: {
					url?: string;
					createdAt?: string;
					dueDate?: string;
				};
			}) => ({
				id: result.id,
				title: result.content?.title || "",
				description: result.content?.description || "",
				type: (result.content?.type || "") as
					| "project"
					| "task"
					| "tasklist"
					| "event",
				status: result.content?.status || "",
				projectName: result.content?.projectName || "",
				url: result.metadata?.url || "",
				projectId: result.content?.projectId || 0,
				score: result.score,
				createdAt: result.metadata?.createdAt
					? new Date(result.metadata.createdAt)
					: new Date(),
				dueDate: result.metadata?.dueDate
					? new Date(result.metadata.dueDate)
					: undefined,
			}),
		);
	}

	async deleteItem(id: string) {
		await this.index.delete(id);
	}

	async deleteByProject(projectId: number) {
		const projectItems = await this.search("", { projectId, limit: 1000 });
		for (const item of projectItems) {
			await this.deleteItem(item.id);
		}
	}

	async deleteTenantIndex() {
		try {
			await this.index.reset();
		} catch (error) {
			console.log(
				`Index for tenant ${this.tenant} does not exist or already deleted`,
			);
		}
	}

	async clearIndex() {
		try {
			await this.index.reset();
		} catch (error) {
			console.log(
				`Index for tenant ${this.tenant} could not be cleared:`,
				error,
			);
		}
	}
}

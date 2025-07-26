import { Search } from "@upstash/search";
import type { calendarEvent, project, task, taskList } from "@/drizzle/schema";

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
			},
			metadata: {
				...searchableItem.metadata,
				url: searchableItem.url,
				projectId: searchableItem.projectId,
				createdAt: searchableItem.createdAt.toISOString(),
				dueDate: searchableItem.dueDate?.toISOString(),
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
			},
			metadata: {
				...searchableItem.metadata,
				url: searchableItem.url,
				projectId: searchableItem.projectId,
				createdAt: searchableItem.createdAt.toISOString(),
				dueDate: searchableItem.dueDate?.toISOString(),
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
			},
			metadata: {
				...searchableItem.metadata,
				url: searchableItem.url,
				projectId: searchableItem.projectId,
				createdAt: searchableItem.createdAt.toISOString(),
				dueDate: searchableItem.dueDate?.toISOString(),
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
			},
			metadata: {
				...searchableItem.metadata,
				url: searchableItem.url,
				projectId: searchableItem.projectId,
				createdAt: searchableItem.createdAt.toISOString(),
			},
		});
	}

	async search(query: string, options?: {
		type?: "project" | "task" | "tasklist" | "event";
		projectId?: number;
		limit?: number;
	}) {
		const index = this.index;
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

		// Build filter (no need for tenant filter since we use tenant-specific index)
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

		const results = await index.search(searchOptions);
		
		return results.map((result: any) => ({
			id: result.id,
			title: result.content.title,
			description: result.content.description,
			type: result.content.type,
			status: result.content.status,
			projectName: result.content.projectName,
			url: result.metadata?.url || "",
			projectId: result.metadata?.projectId || 0,
			score: result.score,
			createdAt: result.metadata?.createdAt ? new Date(result.metadata.createdAt) : new Date(),
			dueDate: result.metadata?.dueDate ? new Date(result.metadata.dueDate) : undefined,
		}));
	}

	async deleteItem(id: string) {
		const index = this.index;
		await index.delete(id);
	}

	async deleteByProject(projectId: number) {
		// Unfortunately Upstash doesn't support bulk delete by filter
		// We'd need to search and delete individually
		const projectItems = await this.search("", { projectId, limit: 1000 });
		for (const item of projectItems) {
			await this.deleteItem(item.id);
		}
	}

	async deleteTenantIndex() {
		// Delete the entire index for a tenant
		const index = this.index;
		try {
			await index.delete(""); // This deletes the entire index
		} catch (error) {
			// Index might not exist, which is fine
			console.log(`Index for tenant ${this.tenant} does not exist or already deleted`);
		}
	}

	async clearIndex() {
		// Clear all entries from the index (for reindexing)
		try {
			await this.index.reset();
		} catch (error) {
			console.log(`Index for tenant ${this.tenant} could not be cleared:`, error);
		}
	}
}


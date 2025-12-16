import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { project } from "@/drizzle/schema";
import { getUserProjectIds } from "@/lib/permissions";
import { createTRPCRouter, protectedProcedure } from "../init";

interface SearchResultRow {
	id: string;
	title: string;
	description: string;
	type: "project" | "task" | "tasklist" | "event" | "post";
	status: string;
	project_id: number;
	project_name: string;
	rank: number;
}

export const searchRouter = createTRPCRouter({
	searchQuery: protectedProcedure
		.input(
			z.object({
				query: z.string().min(1),
				type: z
					.enum(["project", "task", "tasklist", "event", "post"])
					.optional(),
				projectId: z.number().optional(),
				status: z.string().optional(),
				limit: z.number().min(1).max(50).default(20),
			}),
		)
		.query(async ({ input, ctx }) => {
			const userProjectIds = await getUserProjectIds(ctx.db, ctx.userId);

			const createdProjects = await ctx.db.query.project.findMany({
				where: eq(project.createdByUser, ctx.userId),
				columns: { id: true },
			});
			const createdProjectIds = createdProjects.map((p) => p.id);

			const accessibleProjectIds = [
				...new Set([...userProjectIds, ...createdProjectIds]),
			];

			if (accessibleProjectIds.length === 0) {
				return [];
			}

			const searchTerms = input.query
				.trim()
				.split(/\s+/)
				.filter((term) => term.length > 0)
				.map((term) => term.replace(/[^a-zA-Z0-9]/g, ""))
				.filter((term) => term.length > 0);

			if (searchTerms.length === 0) {
				return [];
			}

			const tsQuery = searchTerms.map((term) => `${term}:*`).join(" & ");

			const projectIdsPlaceholder = accessibleProjectIds.join(",");

			let typeFilter = "";
			if (input.type) {
				typeFilter = `AND type = '${input.type}'`;
			}

			let projectFilter = "";
			if (input.projectId) {
				projectFilter = `AND project_id = ${input.projectId}`;
			}

			let statusFilter = "";
			if (input.status) {
				statusFilter = `AND status = '${input.status}'`;
			}

			const query = sql.raw(`
				WITH search_results AS (
					SELECT
						'project-' || id::text as id,
						name as title,
						COALESCE(description, '') as description,
						'project' as type,
						status,
						id as project_id,
						name as project_name,
						ts_rank(to_tsvector('english', name || ' ' || COALESCE(description, '')), to_tsquery('english', '${tsQuery}')) as rank
					FROM "Project"
					WHERE id IN (${projectIdsPlaceholder})
						AND to_tsvector('english', name || ' ' || COALESCE(description, '')) @@ to_tsquery('english', '${tsQuery}')

					UNION ALL

					SELECT
						'task-' || t.id::text as id,
						t.name as title,
						COALESCE(t.description, '') as description,
						'task' as type,
						t.status,
						p.id as project_id,
						p.name as project_name,
						ts_rank(to_tsvector('english', t.name || ' ' || COALESCE(t.description, '')), to_tsquery('english', '${tsQuery}')) as rank
					FROM "Task" t
					JOIN "TaskList" tl ON t."taskListId" = tl.id
					JOIN "Project" p ON tl."projectId" = p.id
					WHERE p.id IN (${projectIdsPlaceholder})
						AND to_tsvector('english', t.name || ' ' || COALESCE(t.description, '')) @@ to_tsquery('english', '${tsQuery}')

					UNION ALL

					SELECT
						'tasklist-' || tl.id::text as id,
						tl.name as title,
						COALESCE(tl.description, '') as description,
						'tasklist' as type,
						tl.status,
						p.id as project_id,
						p.name as project_name,
						ts_rank(to_tsvector('english', tl.name || ' ' || COALESCE(tl.description, '')), to_tsquery('english', '${tsQuery}')) as rank
					FROM "TaskList" tl
					JOIN "Project" p ON tl."projectId" = p.id
					WHERE p.id IN (${projectIdsPlaceholder})
						AND to_tsvector('english', tl.name || ' ' || COALESCE(tl.description, '')) @@ to_tsquery('english', '${tsQuery}')

					UNION ALL

					SELECT
						'event-' || e.id::text as id,
						e.name as title,
						COALESCE(e.description, '') as description,
						'event' as type,
						'' as status,
						p.id as project_id,
						p.name as project_name,
						ts_rank(to_tsvector('english', e.name || ' ' || COALESCE(e.description, '')), to_tsquery('english', '${tsQuery}')) as rank
					FROM "Event" e
					JOIN "Project" p ON e."projectId" = p.id
					WHERE p.id IN (${projectIdsPlaceholder})
						AND to_tsvector('english', e.name || ' ' || COALESCE(e.description, '')) @@ to_tsquery('english', '${tsQuery}')

					UNION ALL

					SELECT
						'post-' || po.id::text as id,
						po.title as title,
						COALESCE(po.content, '') as description,
						'post' as type,
						'' as status,
						p.id as project_id,
						p.name as project_name,
						ts_rank(to_tsvector('english', po.title || ' ' || COALESCE(po.content, '')), to_tsquery('english', '${tsQuery}')) as rank
					FROM "Post" po
					JOIN "Project" p ON po."projectId" = p.id
					WHERE p.id IN (${projectIdsPlaceholder})
						AND po."isDraft" = false
						AND to_tsvector('english', po.title || ' ' || COALESCE(po.content, '')) @@ to_tsquery('english', '${tsQuery}')
				)
				SELECT * FROM search_results
				WHERE 1=1 ${typeFilter} ${projectFilter} ${statusFilter}
				ORDER BY rank DESC
				LIMIT ${input.limit}
			`);

			const results = await ctx.db.execute(query);
			const rows = results as unknown as SearchResultRow[];

			return rows.map((row) => ({
				id: row.id,
				title: row.title,
				description: row.description,
				type: row.type,
				status: row.status,
				projectId: row.project_id,
				projectName: row.project_name,
				url: buildUrl(ctx.orgSlug, row),
				score: row.rank,
				createdAt: new Date(),
				dueDate: undefined,
			}));
		}),
});

function buildUrl(
	orgSlug: string,
	row: SearchResultRow,
): string {
	const projectId = row.project_id;
	const entityId = row.id.split("-")[1];

	switch (row.type) {
		case "project":
			return `/${orgSlug}/projects/${projectId}`;
		case "task":
			return `/${orgSlug}/projects/${projectId}/tasklists?task=${entityId}`;
		case "tasklist":
			return `/${orgSlug}/projects/${projectId}/tasklists/${entityId}`;
		case "event":
			return `/${orgSlug}/projects/${projectId}/events?event=${entityId}`;
		case "post":
			return `/${orgSlug}/projects/${projectId}/posts?post=${entityId}`;
		default:
			return `/${orgSlug}/projects/${projectId}`;
	}
}

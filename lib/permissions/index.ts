import { and, eq } from "drizzle-orm";
import { project, projectPermission } from "@/drizzle/schema";
import type { Database } from "@/drizzle/types";

export type PermissionContext = {
	db: Database;
	userId: string;
	isOrgAdmin: boolean;
	orgId?: string | null;
};

export type ProjectRole = "editor" | "reader";

export interface ProjectPermission {
	projectId: number;
	userId: string;
	role: ProjectRole;
}

export async function checkProjectPermission(
	db: Database,
	projectId: number,
	userId: string,
): Promise<ProjectRole | null> {
	const permission = await db.query.projectPermission.findFirst({
		where: and(
			eq(projectPermission.projectId, projectId),
			eq(projectPermission.userId, userId),
		),
	});

	return permission ? (permission.role as ProjectRole) : null;
}

export async function getUserProjectIds(
	db: Database,
	userId: string,
): Promise<number[]> {
	const permissions = await db.query.projectPermission.findMany({
		where: eq(projectPermission.userId, userId),
		columns: {
			projectId: true,
		},
	});

	return permissions.map((p) => p.projectId);
}

export async function canEditProject(
	ctx: PermissionContext,
	projectId: number,
): Promise<boolean> {
	// Organization admins have edit access to all projects
	if (ctx.isOrgAdmin) return true;

	// Check explicit permission first
	const role = await checkProjectPermission(ctx.db, projectId, ctx.userId);
	if (role === "editor") return true;

	// For backward compatibility, check if user is the creator
	const proj = await ctx.db.query.project.findFirst({
		where: eq(project.id, projectId),
		columns: { createdByUser: true },
	});

	return proj?.createdByUser === ctx.userId;
}

export async function canViewProject(
	ctx: PermissionContext,
	projectId: number,
): Promise<boolean> {
	// Organization admins have view access to all projects
	if (ctx.isOrgAdmin) return true;

	// Check explicit permission first
	const role = await checkProjectPermission(ctx.db, projectId, ctx.userId);
	if (role !== null) return true;

	const proj = await ctx.db.query.project.findFirst({
		where: eq(project.id, projectId),
		columns: { createdByUser: true, organizationId: true },
	});

	// Org members can view all projects in their org
	if (ctx.orgId && proj?.organizationId === ctx.orgId) return true;

	// For backward compatibility, check if user is the creator
	return proj?.createdByUser === ctx.userId;
}

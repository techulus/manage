import { and, eq } from "drizzle-orm";
import { project, projectPermission } from "@/drizzle/schema";
import type { Database } from "@/drizzle/types";

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
	db: Database,
	projectId: number,
	userId: string,
): Promise<boolean> {
	// Check explicit permission first
	const role = await checkProjectPermission(db, projectId, userId);
	if (role === "editor") return true;

	// For backward compatibility, check if user is the creator
	const proj = await db.query.project.findFirst({
		where: eq(project.id, projectId),
		columns: { createdByUser: true },
	});

	return proj?.createdByUser === userId;
}

export async function canViewProject(
	db: Database,
	projectId: number,
	userId: string,
): Promise<boolean> {
	// Check explicit permission first
	const role = await checkProjectPermission(db, projectId, userId);
	if (role !== null) return true;

	// For backward compatibility, check if user is the creator
	const proj = await db.query.project.findFirst({
		where: eq(project.id, projectId),
		columns: { createdByUser: true },
	});

	return proj?.createdByUser === userId;
}

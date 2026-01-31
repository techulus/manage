"use client";

import { useParams } from "next/navigation";
import { useProjectPrefetch } from "@/hooks/use-project-prefetch";
import { TaskListsProvider } from "@/hooks/use-tasklist";

export default function Layout({ children }: { children: React.ReactNode }) {
	const params = useParams();
	const projectId = +params.projectId!;

	useProjectPrefetch(projectId);

	return (
		<TaskListsProvider projectId={projectId}>{children}</TaskListsProvider>
	);
}

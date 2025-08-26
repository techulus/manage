"use client";

import { TaskListsProvider } from "@/hooks/use-tasklist";
import { useProjectPrefetch } from "@/hooks/use-project-prefetch";
import { useParams } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
	const params = useParams();
	const projectId = +params.projectId!;

	useProjectPrefetch(projectId);

	return (
		<TaskListsProvider projectId={projectId}>{children}</TaskListsProvider>
	);
}

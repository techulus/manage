"use client";

import { TaskListsProvider } from "@/hooks/use-tasklist";
import { useParams } from "next/navigation";

export default function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { projectId } = useParams();

	return (
		<TaskListsProvider projectId={+projectId!}>{children}</TaskListsProvider>
	);
}

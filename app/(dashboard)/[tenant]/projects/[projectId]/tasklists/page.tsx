"use client";

import EmptyState from "@/components/core/empty-state";
import PageTitle from "@/components/layout/page-title";
import { TaskListItem } from "@/components/project/tasklist/tasklist";
import { buttonVariants } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQueries } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQueryState } from "nuqs";

export default function TaskLists() {
	const { projectId, tenant } = useParams();
	const [statuses] = useQueryState("status", {
		defaultValue: "active",
	});

	const trpc = useTRPC();
	const [{ data: taskLists }] = useSuspenseQueries({
		queries: [
			trpc.tasks.getTaskLists.queryOptions({
				projectId: +projectId!,
				statuses: statuses.split(",") ?? ["active"],
			}),
		],
	});

	return (
		<>
			<PageTitle
				title="Task Lists"
				actionLabel="New"
				actionLink={`/${tenant}/projects/${projectId}/tasklists/new`}
			/>

			<div className="mx-4 sm:mx-auto my-12 -mt-6 max-w-7xl">
				<EmptyState
					show={!taskLists.length}
					label="task list"
					createLink={`/${tenant}/projects/${projectId}/tasklists/new`}
				/>

				<ul className="grid grid-cols-1 gap-x-4 gap-y-4 lg:grid-cols-2">
					{taskLists.map((taskList) => (
						<TaskListItem key={taskList.id} id={taskList.id} compact />
					))}
				</ul>

				<div className="mx-auto mt-12 flex w-full max-w-7xl flex-grow items-center border-t border-muted">
					{statuses.includes("archived") ? (
						<Link
							href={`/${tenant}/projects/${projectId}/tasklists`}
							className={buttonVariants({ variant: "link" })}
						>
							Hide Archived
						</Link>
					) : (
						<Link
							href={`/${tenant}/projects/${projectId}/tasklists?status=active,archived`}
							className={buttonVariants({ variant: "link" })}
						>
							Show Archived
						</Link>
					)}
				</div>
			</div>
		</>
	);
}

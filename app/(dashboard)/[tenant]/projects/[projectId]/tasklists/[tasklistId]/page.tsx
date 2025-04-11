"use client";

import PageTitle from "@/components/layout/page-title";
import { CommentsSection } from "@/components/project/comment/comments-section";
import { TaskListItem } from "@/components/project/tasklist/tasklist";
import { Progress } from "@/components/ui/progress";
import { toDateStringWithDay } from "@/lib/utils/date";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQueries } from "@tanstack/react-query";
import { CheckCircle, ClockIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import PageLoading from "../loading";

export default function TaskLists() {
	const { projectId, tasklistId, tenant } = useParams();

	const trpc = useTRPC();
	const [{ data: list }, { data: timezone }] = useSuspenseQueries({
		queries: [
			trpc.tasks.getListById.queryOptions({
				id: +tasklistId!,
			}),
			trpc.settings.getTimezone.queryOptions(),
		],
	});

	const totalCount = list?.tasks.length;
	const doneCount = list?.tasks.filter((task) => task.status === "done").length;

	const completedPercent =
		totalCount && doneCount
			? Math.round((doneCount / totalCount) * 100)
			: undefined;

	return (
		<Suspense fallback={<PageLoading />}>
			<PageTitle
				title={list.name}
				actionLabel="Edit"
				actionLink={`/${tenant}/projects/${projectId}/tasklists/${list.id}/edit`}
			>
				<div className="flex flex-col pr-4 md:pr-0 space-y-2 md:flex-row md:space-y-0 md:space-x-2 text-gray-500 dark:text-gray-400">
					{totalCount != null && doneCount != null ? (
						<div className="flex w-[280px] flex-row items-center space-x-2">
							<CheckCircle className="w-4 h-4" />
							<p className="block">
								{doneCount} of {totalCount}
							</p>

							{completedPercent ? (
								<>
									<Progress
										className="h-3 max-w-[130px]"
										value={completedPercent}
									/>
									<span className="ml-2">{completedPercent}%</span>
								</>
							) : null}
						</div>
					) : null}

					{list.dueDate ? (
						<div className="flex flex-row items-center space-x-2">
							<ClockIcon className="w-4 h-4" />
							<p className="block">
								{list.dueDate ? (
									<span suppressHydrationWarning>
										Due {toDateStringWithDay(list.dueDate, timezone)}
									</span>
								) : null}
							</p>
						</div>
					) : null}
				</div>
			</PageTitle>

			<div className="mx-auto -mt-8 max-w-7xl">
				<TaskListItem key={list.id} id={list.id} hideHeader />

				<div className="py-8">
					<CommentsSection
						roomId={`project/${projectId}/tasklist/${tasklistId}`}
					/>
				</div>
			</div>
		</Suspense>
	);
}

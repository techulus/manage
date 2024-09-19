"use client";

import { forkTaskList } from "@/app/(dashboard)/[tenant]/projects/[projectId]/tasklists/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import type { TaskList } from "@/drizzle/types";
import { CheckCircle, CircleEllipsisIcon, ClockIcon } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export const TaskListHeader = ({
	taskList,
	totalCount,
	doneCount,
	orgSlug,
	partialUpdateTaskList,
}: {
	taskList: TaskList;
	totalCount?: number;
	doneCount?: number;
	orgSlug: string;
	partialUpdateTaskList?: (
		id: number,
		data: { status: string },
	) => Promise<void>;
}) => {
	const completedPercent =
		totalCount != null && doneCount != null
			? Math.round((doneCount / totalCount) * 100)
			: null;

	return (
		<div className="group relative flex items-center gap-x-4 rounded-tl-lg rounded-tr-lg bg-white p-3 dark:bg-black">
			<Link
				href={`/${orgSlug}/projects/${taskList.projectId}/tasklists/${taskList.id}`}
				className="text-sm font-medium flex-grow flex-auto"
				prefetch={false}
			>
				<span className="absolute inset-0" aria-hidden="true" />
				<div className="mb-2 flex">
					<div className="text-xl leading-6">
						{taskList.name}
						{taskList.status === "archived" ? " (Archived)" : null}
					</div>
				</div>

				<div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
					{totalCount != null && doneCount != null ? (
						<div className="flex flex-grow flex-row items-center border rounded-lg py-1 px-2 space-x-2 text-gray-500 dark:text-gray-400">
							<CheckCircle className="w-4 h-4" />
							<p className="block">
								{doneCount} of {totalCount}
							</p>

							{completedPercent != null ? (
								<>
									<Progress
										className="h-3 max-w-[120px]"
										value={completedPercent}
									/>
									<span className="ml-2">{completedPercent}%</span>
								</>
							) : null}
						</div>
					) : null}

					{taskList.dueDate ? (
						<div className="flex flex-shrink flex-row items-center border rounded-lg py-1 px-2 space-x-2 text-gray-500">
							<ClockIcon className="w-4 h-4" />
							<p className="block">
								{taskList.dueDate ? (
									<span suppressHydrationWarning>
										Due {taskList.dueDate.toLocaleDateString()}
									</span>
								) : null}
							</p>
						</div>
					) : null}
				</div>
			</Link>

			<DropdownMenu>
				<DropdownMenuTrigger className="absolute right-3 top-3">
					<CircleEllipsisIcon className="h-6 w-6" />
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem className="w-full p-0">
						<Link
							href={`/${orgSlug}/projects/${taskList.projectId}/tasklists/${taskList.id}/edit`}
							className={buttonVariants({
								variant: "ghost",
								className: "w-full",
							})}
							prefetch={false}
						>
							Edit
						</Link>
					</DropdownMenuItem>
					partialUpdateTaskList ? (
					<DropdownMenuItem className="w-full p-0">
						<Button
							variant="ghost"
							className="w-full"
							onClick={async () => {
								if (!partialUpdateTaskList) return;
								toast.promise(
									partialUpdateTaskList(taskList.id, {
										status:
											taskList.status === "active" ? "archived" : "active",
									}),
									{
										loading: "Updating task list...",
										success: "Task list updated.",
										error: "Failed to update task list.",
									},
								);
							}}
						>
							{taskList.status === "active" ? "Archive" : "Unarchive"}
						</Button>
					</DropdownMenuItem>
					) : null
					<DropdownMenuItem className="w-full p-0">
						<Button
							variant="ghost"
							className="w-full"
							onClick={async () => {
								toast.promise(forkTaskList(taskList.id, taskList.projectId), {
									loading: "Creating new task list...",
									success: "New task list created.",
									error: "Failed to create task list.",
								});
							}}
						>
							Fork
						</Button>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

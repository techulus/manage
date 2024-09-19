"use client";

import { forkTaskList } from "@/app/(dashboard)/[tenant]/projects/[projectId]/tasklists/actions";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TaskList } from "@/drizzle/types";
import { cn } from "@/lib/utils";
import { CheckCircle, CircleEllipsisIcon } from "lucide-react";
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
		totalCount != null && doneCount != null ? doneCount / totalCount : null;

	return (
		<div className="group relative flex items-center gap-x-4 rounded-tl-lg rounded-tr-lg bg-white p-3 dark:bg-black">
			<Link
				href={`/${orgSlug}/projects/${taskList.projectId}/tasklists/${taskList.id}`}
				className="text-sm font-medium"
				prefetch={false}
			>
				<span className="absolute inset-0" aria-hidden="true" />
				<div className="mb-2 flex">
					<div className="text-xl leading-6">
						{taskList.name}
						{taskList.status === "archived" ? " (Archived)" : null}
					</div>
				</div>

				{totalCount != null && doneCount != null ? (
					<div className="flex flex-row items-center border rounded-lg py-1 px-2 space-x-2">
						<CheckCircle className="w-4 h-4" />
						<p className="block">
							{doneCount} of {totalCount} done
							{taskList.dueDate ? (
								<span>, due {taskList.dueDate.toLocaleDateString()}</span>
							) : null}
						</p>
					</div>
				) : null}

				{completedPercent != null ? (
					<div
						className={cn(
							"mt-2 bottom-0 left-0 z-0 h-2 rounded-lg bg-primary opacity-70 transition-all",
							completedPercent === 1 ? "rounded-tr-lg" : null,
						)}
						style={{ width: `${completedPercent * 100}%` }}
					/>
				) : null}
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
					{partialUpdateTaskList ? (
						<DropdownMenuItem className="w-full p-0">
							<Button
								variant="ghost"
								className="w-full"
								onClick={async () => {
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
					) : null}
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

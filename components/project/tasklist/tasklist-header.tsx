"use client";

import { DeleteButton } from "@/components/form/button";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TaskList } from "@/drizzle/types";
import { useTaskLists } from "@/hooks/use-tasklist";
import { CheckCircle, CircleEllipsisIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

export const TaskListHeader = ({
	taskList,
	totalCount,
	doneCount,
}: {
	taskList: TaskList;
	totalCount?: number;
	doneCount?: number;
}) => {
	const { tenant } = useParams();

	const completedPercent =
		totalCount && doneCount
			? Math.round((doneCount / totalCount) * 100)
			: undefined;

	const { updateTaskList, deleteTaskList } = useTaskLists();

	return (
		<div className="group relative flex items-center gap-x-4 rounded-tl-lg rounded-tr-lg bg-muted p-3">
			<Link
				href={`/${tenant}/projects/${taskList.projectId}/tasklists/${taskList.id}`}
				className="text-sm font-medium flex-grow flex-auto"
			>
				<span className="absolute inset-0" aria-hidden="true" />
				<div className="mb-2 flex">
					<div className="text-xl tracking-tighter leading-6">
						{taskList.name}
						{taskList.status === "archived" ? " (Archived)" : null}
					</div>
				</div>

				<div className="flex flex-col space-y-2 text-gray-500 dark:text-gray-400">
					<div className="flex flex-row items-center space-x-2">
						<CheckCircle className="w-4 h-4" />
						<p className="block text-primary font-semibold">
							{doneCount} of {totalCount}
						</p>

						{completedPercent ? (
							<span className="ml-2 text-sm">({completedPercent}%)</span>
						) : null}
					</div>
				</div>
			</Link>

			<DropdownMenu>
				<DropdownMenuTrigger className="absolute right-3 top-3">
					<CircleEllipsisIcon className="h-6 w-6" />
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem className="w-full p-0">
						<Button
							variant="ghost"
							className="w-full"
							size="sm"
							onClick={async () => {
								toast.promise(
									updateTaskList.mutateAsync({
										id: taskList.id,
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
					<DropdownMenuItem className="w-full p-0">
						<DropdownMenuItem className="w-full p-0">
							<form
								action={() => {
									toast.promise(
										deleteTaskList.mutateAsync({ id: taskList.id }),
										{
											loading: "Deleting task list...",
											success: "Task list deleted.",
											error: "Failed to delete task list.",
										},
									);
								}}
								className="w-full"
							>
								<DeleteButton action="Delete" className="w-full" compact />
							</form>
						</DropdownMenuItem>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

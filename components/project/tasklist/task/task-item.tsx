"use client";

import { Panel } from "@/components/core/panel";
import EditableText from "@/components/form/editable-text";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TaskList, TaskWithDetails } from "@/drizzle/types";
import { cn } from "@/lib/utils";
import { toDateStringWithDay, toStartOfDay } from "@/lib/utils/date";
import { useTRPC } from "@/trpc/client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Close, Title } from "@radix-ui/react-dialog";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { AlignJustifyIcon, CalendarClock, FileIcon, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Card } from "../../../ui/card";
import { Checkbox } from "../../../ui/checkbox";
import { DateTimePicker } from "../../events/date-time-picker";
import { Assignee } from "../../shared/assigee";
import { AssignToUser } from "../../shared/assign-to-user";
import TaskNotesForm from "./notes-form";

export const TaskItem = ({
	task,
	compact = false,
}: {
	task: TaskWithDetails;
	compact?: boolean;
}) => {
	const { projectId } = useParams();
	const [detailsOpen, setDetailsOpen] = useState(false);
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id: task.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const updateTaskToastOptions = {
		loading: "Saving...",
		success: "Done!",
		error: "Error while saving, please try again.",
	};

	const trpc = useTRPC();
	const [{ data: users = [] }, { data: taskLists = [] }, { data: timezone }] =
		useQueries({
			queries: [
				trpc.settings.getAllUsers.queryOptions(),
				trpc.tasks.getTaskLists.queryOptions({
					projectId: +projectId!,
				}),
				trpc.settings.getTimezone.queryOptions(),
			],
		});

	const invalidateData = useCallback(() => {
		queryClient.invalidateQueries({
			queryKey: trpc.tasks.getListById.queryKey({ id: task.taskListId }),
		});
		queryClient.invalidateQueries({
			queryKey: trpc.tasks.getTaskLists.queryKey({
				projectId: +projectId!,
			}),
		});
	}, [
		projectId,
		task.taskListId,
		trpc.tasks.getListById.queryKey,
		trpc.tasks.getTaskLists.queryKey,
	]);

	const queryClient = useQueryClient();
	const createTask = useMutation(
		trpc.tasks.createTask.mutationOptions({
			onSuccess: invalidateData,
		}),
	);
	const updateTask = useMutation(
		trpc.tasks.updateTask.mutationOptions({
			onSuccess: invalidateData,
		}),
	);
	const deleteTask = useMutation(
		trpc.tasks.deleteTask.mutationOptions({
			onSuccess: invalidateData,
		}),
	);

	return (
		<>
			<Card
				className={cn(
					"flex scale-100 rounded-lg shadow-none",
					"flex-row items-center justify-center space-x-2 border-none",
				)}
				ref={setNodeRef}
				style={style}
			>
				{!compact ? (
					<Checkbox
						checked={task.status === "done"}
						className={cn(
							"my-4 ml-6 mr-1 transition-all",
							compact ? "py-0 my-0" : "",
							task.status === "done" ? "my-2.5 opacity-50" : "scale-125",
						)}
						onCheckedChange={async (checked) => {
							if (compact) return;
							const status = checked ? "done" : "todo";

							toast.promise(
								updateTask.mutateAsync({
									id: task.id,
									status,
								}),
								updateTaskToastOptions,
							);
						}}
					/>
				) : null}
				<button
					type="button"
					className={cn(
						"text-md w-full py-1 text-left font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
						compact ? "ml-3 py-0" : "",
						task.status === "done" ? "text-muted-foreground line-through" : "",
					)}
					onClick={() => {
						if (!compact) setDetailsOpen(true);
					}}
				>
					<div
						className={cn(
							"flex w-full items-center py-2",
							task.status !== "done" ? "border-b" : "",
						)}
					>
						{task.assignee ? (
							<Assignee className="mr-2" user={task.assignee} imageOnly />
						) : null}
						{task.name}
						{task.dueDate ? (
							<span className="text-muted-foreground ml-2 text-sm">
								<CalendarClock className="h-4 w-4 inline-block text-primary mr-1 -mt-1" />
								{!compact ? (
									<span className="hidden md:inline">
										{toDateStringWithDay(task.dueDate, timezone!)}
									</span>
								) : null}
							</span>
						) : null}
						{task.description ? (
							<span className="ml-2">
								<FileIcon className="h-4 w-4 text-primary" />
							</span>
						) : null}
					</div>
				</button>

				{task.status !== "done" && !compact ? (
					<div
						className="cursor-move touch-none p-1 pr-3"
						{...attributes}
						{...listeners}
					>
						<AlignJustifyIcon className="h-5 w-5 opacity-40" />
					</div>
				) : null}
			</Card>

			<Panel open={detailsOpen} setOpen={setDetailsOpen}>
				<Title>
					<div className="flex items-center px-4 h-14 border-b">
						<div className="flex items-center flex-1">
							<Checkbox
								checked={task.status === "done"}
								className={cn(
									task.status === "done" ? "opacity-50" : "",
									"mr-2",
								)}
								onCheckedChange={async (checked) => {
									const status = checked ? "done" : "todo";

									toast.promise(
										updateTask.mutateAsync({
											id: task.id,
											status,
										}),
										updateTaskToastOptions,
									);
								}}
							/>

							<EditableText
								value={task.name}
								label="task"
								onChange={async (val) => {
									await updateTask.mutateAsync({
										id: task.id,
										name: val,
									});
								}}
							/>
						</div>
						<Close asChild>
							<button
								type="button"
								aria-label="Close"
								className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
							>
								<X className="h-6 w-6" />
								<span className="sr-only">Close</span>
							</button>
						</Close>
					</div>
				</Title>

				<div className="flex-1 overflow-hidden overflow-y-scroll">
					<div className="space-y-6 p-6">
						<div className="space-y-1">
							<h4 className="text-sm font-medium">Notes</h4>
							<TaskNotesForm task={task} />
						</div>

						<div className="space-y-1">
							<h4 className="text-sm font-medium">Assigned to</h4>
							<div className="flex items-center justify-between">
								{task.assignee ? (
									<>
										<Assignee user={task.assignee} />
										<Button
											size="sm"
											variant="outline"
											className="text-primary hover:text-red-500"
											onClick={() => {
												toast.promise(
													updateTask.mutateAsync({
														id: task.id,
														assignedToUser: null,
													}),
													updateTaskToastOptions,
												);
											}}
										>
											Unassign
										</Button>
									</>
								) : (
									<AssignToUser
										users={users}
										onUpdate={(userId) => {
											toast.promise(
												updateTask.mutateAsync({
													id: task.id,
													assignedToUser: userId,
												}),
												updateTaskToastOptions,
											);
										}}
									/>
								)}
							</div>
						</div>

						<div className="space-y-1">
							<h4 className="text-sm font-medium">Due</h4>
							{task.dueDate ? (
								<div className="flex items-center justify-between">
									<p className="text-sm">
										{toDateStringWithDay(task.dueDate, timezone!)}
									</p>
									<Button
										size="sm"
										variant="outline"
										className="text-primary hover:text-red-500"
										onClick={() => {
											toast.promise(
												updateTask.mutateAsync({
													id: task.id,
													dueDate: null,
												}),
												updateTaskToastOptions,
											);
										}}
									>
										Remove
									</Button>
								</div>
							) : (
								<div className="w-[220px]">
									<DateTimePicker
										dateOnly
										name="dueDate"
										onSelect={(dueDate) => {
											toast.promise(
												updateTask.mutateAsync({
													id: task.id,
													dueDate: toStartOfDay(dueDate).toISOString(),
												}),
												updateTaskToastOptions,
											);
										}}
									/>
								</div>
							)}
						</div>

						<div className="space-y-1">
							<div className="flex items-center justify-between">
								<h4 className="text-sm font-medium">Created By</h4>
								<div className="space-x-2"></div>
							</div>
							<p className="text-sm text-muted-foreground">
								{task.creator?.firstName}
							</p>
						</div>

						{taskLists?.filter((x) => x.id !== task.taskListId)?.length ? (
							<div className="space-y-1">
								<h4 className="text-sm font-medium">Actions</h4>
								<div className="flex items-center space-x-2">
									<Button
										size="sm"
										variant="outline"
										className="text-primary hover:text-red-500"
										onClick={() => {
											toast.promise(
												deleteTask.mutateAsync({
													id: task.id,
												}),
												{
													loading: "Deleting...",
													success: "Deleted!",
													error: "Error while deleting, please try again.",
												},
											);
										}}
									>
										Delete
									</Button>

									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="outline"
												size="sm"
												className="text-primary"
											>
												Move to...
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent>
											{taskLists
												.filter((x) => x.id !== task.taskListId)
												.map((list) => (
													<DropdownMenuItem key={list.id} className="w-full">
														<form
															className="w-full"
															action={() => {
																toast.promise(
																	updateTask
																		.mutateAsync({
																			id: task.id,
																			taskListId: list.id,
																		})
																		.then(() => {
																			queryClient.invalidateQueries({
																				queryKey:
																					trpc.tasks.getListById.queryKey({
																						id: list.id,
																					}),
																			});
																		}),
																	{
																		loading: "Moving...",
																		success: "Moved!",
																		error:
																			"Error while moving, please try again.",
																	},
																);
															}}
														>
															<button
																type="submit"
																className="w-full text-left"
															>
																{list.name}
															</button>
														</form>
													</DropdownMenuItem>
												))}
										</DropdownMenuContent>
									</DropdownMenu>

									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="outline"
												size="sm"
												className="text-primary"
											>
												Copy to...
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent>
											{taskLists
												.filter((x) => x.id !== task.taskListId)
												.map((list: TaskList) => (
													<DropdownMenuItem key={list.id} className="w-full">
														<form
															className="w-full"
															action={() => {
																toast.promise(
																	createTask
																		.mutateAsync({
																			name: task.name,
																			taskListId: list.id,
																			status: "todo",
																		})
																		.then(() => {
																			queryClient.invalidateQueries({
																				queryKey:
																					trpc.tasks.getListById.queryKey({
																						id: list.id,
																					}),
																			});
																		}),
																	{
																		loading: "Copying...",
																		success: "Copied!",
																		error:
																			"Error while copying, please try again.",
																	},
																);
															}}
														>
															<button
																type="submit"
																className="w-full text-left"
															>
																{list.name}
															</button>
														</form>
													</DropdownMenuItem>
												))}
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</div>
						) : null}
					</div>
				</div>
			</Panel>
		</>
	);
};

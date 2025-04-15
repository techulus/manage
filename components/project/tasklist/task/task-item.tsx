"use client";

import { Panel } from "@/components/core/panel";
import { UserAvatar } from "@/components/core/user-avatar";
import EditableText from "@/components/form/editable-text";
import NotesForm from "@/components/form/notes-form";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
	TaskList,
	TaskListWithTasks,
	TaskWithDetails,
} from "@/drizzle/types";
import { cn } from "@/lib/utils";
import { toDateStringWithDay, toStartOfDay } from "@/lib/utils/date";
import { useTRPC } from "@/trpc/client";
import { useUser } from "@clerk/nextjs";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Close, Title } from "@radix-ui/react-dialog";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { AlignJustifyIcon, CalendarClock, FileIcon, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Checkbox } from "../../../ui/checkbox";
import { DateTimePicker } from "../../events/date-time-picker";
import { Assignee } from "../../shared/assigee";
import { AssignToUser } from "../../shared/assign-to-user";

export const TaskItem = ({
	task,
	compact = false,
}: {
	task: TaskWithDetails;
	compact?: boolean;
}) => {
	const { user } = useUser();
	const { projectId } = useParams();
	const [detailsOpen, setDetailsOpen] = useState(false);
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id: task.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
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
			onMutate: async (newTask) => {
				await queryClient.cancelQueries({
					queryKey: trpc.tasks.getListById.queryKey({ id: newTask.taskListId }),
				});

				const previousTasks = queryClient.getQueryData<TaskListWithTasks>(
					trpc.tasks.getListById.queryKey({ id: newTask.taskListId }),
				);

				queryClient.setQueryData<TaskListWithTasks>(
					trpc.tasks.getListById.queryKey({ id: newTask.taskListId }),
					(tasklist) => {
						if (!tasklist) return tasklist;

						const createdTask: TaskWithDetails = {
							id: Date.now(),
							taskListId: newTask.taskListId || 0,
							name: newTask.name || "",
							description: null,
							status: newTask.status || "todo",
							dueDate: null,
							createdAt: new Date(),
							updatedAt: new Date(),
							createdByUser: "",
							position: 0,
							assignedToUser: null,
							creator: {
								firstName: user?.firstName || null,
								imageUrl: user?.imageUrl || null,
							},
							assignee: null,
						};

						return {
							...tasklist,
							tasks: [...(tasklist.tasks || []), createdTask],
						};
					},
				);

				return { previousTasks };
			},
			onError: (error, newTask, context) => {
				console.error(error);
				toast.error("Oops, something went wrong, please try again.");
				if (context?.previousTasks) {
					queryClient.setQueryData<TaskListWithTasks>(
						trpc.tasks.getListById.queryKey({ id: newTask.taskListId }),
						context.previousTasks,
					);
				}
			},
		}),
	);
	const updateTask = useMutation(
		trpc.tasks.updateTask.mutationOptions({
			onSuccess: invalidateData,
			onMutate: async (updatedTask) => {
				await queryClient.cancelQueries({
					queryKey: trpc.tasks.getListById.queryKey({ id: task.taskListId }),
				});

				const previousTasks = queryClient.getQueryData<TaskListWithTasks>(
					trpc.tasks.getListById.queryKey({ id: task.taskListId }),
				);

				queryClient.setQueryData<TaskListWithTasks>(
					trpc.tasks.getListById.queryKey({ id: task.taskListId }),
					(tasklist) => {
						if (!tasklist) return tasklist;

						const updatedTaskWithDate = {
							...updatedTask,
							dueDate:
								"dueDate" in updatedTask && updatedTask.dueDate
									? new Date(updatedTask.dueDate)
									: null,
							updatedAt: new Date(),
						};

						return {
							...tasklist,
							tasks: tasklist.tasks.map((t) =>
								t.id === updatedTask.id
									? ({
											...t,
											...updatedTaskWithDate,
										} as unknown as TaskWithDetails)
									: t,
							),
						};
					},
				);

				return { previousTasks };
			},
			onError: (err, _, context) => {
				console.error(err);
				toast.error("Oops, something went wrong, please try again.");
				if (context?.previousTasks) {
					queryClient.setQueryData<TaskListWithTasks>(
						trpc.tasks.getListById.queryKey({ id: task.taskListId }),
						context.previousTasks,
					);
				}
			},
		}),
	);

	const deleteTask = useMutation(
		trpc.tasks.deleteTask.mutationOptions({
			onSuccess: invalidateData,
			onMutate: async (deletedTask) => {
				await queryClient.cancelQueries({
					queryKey: trpc.tasks.getListById.queryKey({ id: task.taskListId }),
				});

				const previousTasks = queryClient.getQueryData<TaskListWithTasks>(
					trpc.tasks.getListById.queryKey({ id: task.taskListId }),
				);

				queryClient.setQueryData<TaskListWithTasks>(
					trpc.tasks.getListById.queryKey({ id: task.taskListId }),
					(tasklist) => {
						if (!tasklist) return tasklist;
						return {
							...tasklist,
							tasks: tasklist.tasks.filter((t) => t.id !== deletedTask.id),
						};
					},
				);

				return { previousTasks };
			},
			onError: (error, _, context) => {
				console.error(error);
				toast.error("Oops, something went wrong, please try again.");
				if (context?.previousTasks) {
					queryClient.setQueryData<TaskListWithTasks>(
						trpc.tasks.getListById.queryKey({ id: task.taskListId }),
						context.previousTasks,
					);
				}
			},
		}),
	);

	return (
		<>
			<div
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
							updateTask.mutate({
								id: task.id,
								status,
							});
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
							task.status !== "done" ? "border-b dark:border-white/10" : "",
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
			</div>

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
									updateTask.mutate({
										id: task.id,
										status,
									});
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
						<form
							action={async (formData) => {
								await updateTask.mutateAsync({
									id: task.id,
									description: formData.get("description") as string,
								});
							}}
						>
							<NotesForm value={task.description} name="description" />
						</form>

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
												updateTask.mutate({
													id: task.id,
													assignedToUser: null,
												});
											}}
										>
											Unassign
										</Button>
									</>
								) : (
									<AssignToUser
										users={users}
										onUpdate={(userId) => {
											updateTask.mutate({
												id: task.id,
												assignedToUser: userId,
											});
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
											updateTask.mutate({
												id: task.id,
												dueDate: null,
											});
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
											updateTask.mutate({
												id: task.id,
												dueDate: toStartOfDay(dueDate).toISOString(),
											});
										}}
									/>
								</div>
							)}
						</div>

						<div className="space-y-1">
							<div className="flex items-center justify-between">
								<h4 className="text-sm font-medium">Created By</h4>
							</div>
							<p className="text-sm text-muted-foreground flex items-center gap-2">
								<UserAvatar user={task.creator} compact />{" "}
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
											deleteTask.mutate({
												id: task.id,
											});
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

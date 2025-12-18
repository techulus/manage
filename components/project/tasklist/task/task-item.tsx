"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Close, Title } from "@radix-ui/react-dialog";
import { useQueries } from "@tanstack/react-query";
import { AlignJustifyIcon, CalendarClock, FileIcon, X } from "lucide-react";
import { useParams } from "next/navigation";
import { parseAsInteger, useQueryState } from "nuqs";
import { useMemo } from "react";
import { toast } from "sonner";
import { Panel } from "@/components/core/panel";
import { ConfirmButton } from "@/components/form/button";
import EditableText from "@/components/form/editable-text";
import NotesForm from "@/components/form/notes-form";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	type TaskList,
	TaskStatus,
	type TaskWithDetails,
} from "@/drizzle/types";
import { useTasks } from "@/hooks/use-tasks";
import { cn } from "@/lib/utils";
import { toDateStringWithDay, toStartOfDay } from "@/lib/utils/date";
import { useTRPC } from "@/trpc/client";
import { Checkbox } from "../../../ui/checkbox";
import { CommentsSection } from "../../comment/comments-section";
import { DateTimePicker } from "../../events/date-time-picker";
import { AssignToUser } from "../../shared/assign-to-user";
import { UserBadge } from "../../shared/user-badge";

export const TaskItem = ({
	task,
	compact = false,
	canEdit = true,
}: {
	task: TaskWithDetails;
	compact?: boolean;
	canEdit?: boolean;
}) => {
	const { projectId } = useParams();
	const [selectedTaskId, setSelectedTaskId] = useQueryState(
		"task",
		parseAsInteger,
	);
	const detailsOpen = selectedTaskId === task.id;
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
				trpc.settings.getAllUsers.queryOptions(true),
				trpc.tasks.getTaskLists.queryOptions({
					projectId: +projectId!,
				}),
				trpc.settings.getTimezone.queryOptions(),
			],
		});

	const { createTask, updateTask, deleteTask } = useTasks();

	const creating = useMemo(() => task.id > Date.now(), [task.id]);
	const isDone = useMemo(
		() => task.status === TaskStatus.DONE || task.status === TaskStatus.DELETED,
		[task.status],
	);

	return (
		<>
			<div
				className={cn(
					"flex scale-100 rounded-lg shadow-none",
					"flex-row items-center justify-center space-x-2 border-none",
					"hover:bg-primary/20",
				)}
				ref={setNodeRef}
				style={style}
			>
				{!compact ? (
					<Checkbox
						checked={isDone}
						className={cn(
							"my-4 ml-6 mr-1 transition-all",
							compact ? "py-0 my-0" : "",
							isDone ? "my-2.5 opacity-50" : "scale-125",
							!canEdit ? "cursor-not-allowed" : "",
						)}
						disabled={!canEdit}
						onCheckedChange={async (checked) => {
							if (compact || !canEdit) return;
							const status = checked ? TaskStatus.DONE : TaskStatus.TODO;
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
						isDone ? "text-muted-foreground line-through" : "",
						creating ? "text-muted-foreground" : "",
					)}
					onClick={() => {
						if (!creating) setSelectedTaskId(task.id);
					}}
				>
					<div
						className={cn(
							"flex w-full items-center py-2",
							!isDone ? "border-b dark:border-white/10" : "",
						)}
					>
						{task.assignee ? (
							<UserBadge className="mr-2" user={task.assignee} imageOnly />
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

				{!isDone && !compact && !creating && canEdit ? (
					<div
						className="cursor-move touch-none p-1 pr-3"
						{...attributes}
						{...listeners}
					>
						<AlignJustifyIcon className="h-5 w-5 opacity-40" />
					</div>
				) : null}
			</div>

			<Panel
				open={detailsOpen}
				setOpen={(open) => {
					if (!open) setSelectedTaskId(null);
				}}
			>
				<Title>
					<div className="flex items-center px-4 h-14 border-b">
						<div className="flex items-center flex-1">
							<Checkbox
								checked={isDone}
								className={cn(isDone ? "opacity-50" : "", "mr-2")}
								onCheckedChange={async (checked) => {
									const status = checked ? TaskStatus.DONE : TaskStatus.TODO;
									updateTask.mutate({
										id: task.id,
										status,
									});
								}}
							/>

							<EditableText
								value={task.name}
								label="task"
								onChange={(val) => {
									if (!canEdit) return;
									updateTask.mutate({
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
							action={(formData) => {
								if (!canEdit) return;
								updateTask.mutate({
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
										<UserBadge user={task.assignee} />
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
											if (userId) {
												updateTask.mutate({
													id: task.id,
													assignedToUser: userId,
												});
											}
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
							<UserBadge user={task.creator} />
						</div>

						<div className="space-y-1">
							<h4 className="text-sm font-medium">Actions</h4>
							<div className="flex items-center space-x-2">
								<ConfirmButton
									label="Delete"
									confirmLabel="Are you sure?"
									size="sm"
									onClick={() => {
										deleteTask.mutate({
											id: task.id,
										});
									}}
								/>

								{taskLists?.filter((x) => x.id !== task.taskListId)?.length ? (
									<>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="outline" size="sm">
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
																	updateTask.mutate({
																		id: task.id,
																		taskListId: list.id,
																	});
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
												<Button variant="outline" size="sm">
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
																action={async () => {
																	await toast.promise(
																		createTask.mutateAsync({
																			name: task.name,
																			taskListId: list.id,
																			status: TaskStatus.TODO,
																			description:
																				task.description || undefined,
																			assignedToUser:
																				task.assignedToUser || undefined,
																			dueDate: task.dueDate
																				? task.dueDate.toISOString()
																				: undefined,
																		}),
																		{
																			loading: "Copying...",
																			success: "Copied!",
																			error:
																				"Error while copying, please try again.",
																		},
																	);
																	setSelectedTaskId(null);
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
									</>
								) : null}
							</div>
						</div>

						<CommentsSection roomId={`task-${task.id}`} />
					</div>
				</div>
			</Panel>
		</>
	);
};

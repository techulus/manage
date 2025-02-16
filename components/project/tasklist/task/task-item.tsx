"use client";

import {
	copyTaskToTaskList,
	deleteTask,
	moveTaskToTaskList,
	updateTask,
} from "@/app/(dashboard)/[tenant]/projects/[projectId]/tasklists/actions";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { Task, TaskList, TaskWithDetails } from "@/drizzle/types";
import { cn } from "@/lib/utils";
import { toDateStringWithDay, toStartOfDay } from "@/lib/utils/date";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlignJustifyIcon, CalendarClock, FileIcon } from "lucide-react";
import { useReducer, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "../../../ui/card";
import { Checkbox } from "../../../ui/checkbox";
import { DateTimePicker } from "../../events/date-time-picker";
import { Assignee } from "../../shared/assigee";
import { AssignToUser } from "../../shared/assign-to-user";
import TaskNotesForm from "./notes-form";

export const TaskItem = ({
	task,
	projectId,
	taskLists,
	timezone,
	compact = false,
}: {
	task: TaskWithDetails;
	projectId: number;
	timezone: string;
	taskLists?: TaskList[];
	compact?: boolean;
}) => {
	const [detailsOpen, setDetailsOpen] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [optimisticTask, updateOptimisticTask] = useReducer(
		(task: Task, data: { status: string } | { name: string }) => ({
			...task,
			...data,
		}),
		task,
	);

	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id: task.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const { id, name, status } = optimisticTask;

	const updateTaskToastOptions = {
		loading: "Saving...",
		success: "Done!",
		error: "Error while saving, please try again.",
	};

	return (
		<Card
			className={cn(
				"flex scale-100 rounded-lg shadow-none dark:bg-black",
				detailsOpen
					? "my-1 scale-[1.03] flex-col border-2 border-gray-200 bg-gray-50 dark:border-gray-700"
					: "flex-row items-center justify-center space-x-2 border-none",
			)}
			ref={setNodeRef}
			style={style}
		>
			{detailsOpen ? (
				<>
					<CardHeader className="py-0">
						<div className="flex items-center space-x-2">
							<Checkbox
								checked={status === "done"}
								className={cn(
									status === "done" ? "opacity-50" : "scale-125",
									"my-4 mr-1",
								)}
								onCheckedChange={async (checked) => {
									const status = checked ? "done" : "todo";
									updateOptimisticTask({ status });

									toast.promise(
										updateTask(id, projectId, { status }),
										updateTaskToastOptions,
									);
								}}
								disabled={isEditing}
							/>

							{isEditing ? (
								<Input
									type="text"
									value={name}
									onChange={(e) =>
										updateOptimisticTask({ name: e.target.value })
									}
									className="text-md w-full text-left font-medium leading-none"
								/>
							) : (
								<button
									type="button"
									onClick={() => setDetailsOpen(false)}
									className={cn(
										"text-md w-full py-1 text-left font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
										status === "done"
											? "text-muted-foreground line-through"
											: "",
									)}
								>
									{name}
								</button>
							)}
						</div>
					</CardHeader>
					<CardContent className="pb-3">
						<dl>
							<div className="py-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
								<dt className="text-sm font-medium leading-6">Created By</dt>
								<dd className="mt-1 flex text-sm leading-6 sm:col-span-2 sm:mt-0">
									<span className="flex-grow">{task.creator?.firstName}</span>
									<Button
										size="sm"
										variant="outline"
										className="mr-2 text-primary"
										onClick={async () => {
											setIsEditing((val) => !val);

											if (!isEditing) return;

											toast.promise(
												updateTask(id, projectId, { name }),
												updateTaskToastOptions,
											);
										}}
									>
										{isEditing ? "Save" : "Edit"}
									</Button>
									<Button
										size="sm"
										variant="outline"
										className="text-primary hover:text-red-500"
										onClick={() => {
											toast.promise(
												deleteTask({
													id,
													projectId,
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
								</dd>
							</div>
						</dl>
						<dl>
							<div className="py-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
								<dt className="text-sm font-medium leading-6">Assigned to</dt>
								<dd className="mt-1 flex text-sm leading-6 sm:col-span-2 sm:mt-0">
									{task.assignee ? (
										<>
											<span className="flex-grow">
												<Assignee user={task.assignee} />
											</span>
											<Button
												size="sm"
												variant="outline"
												className="text-primary hover:text-red-500"
												onClick={() => {
													toast.promise(
														updateTask(id, projectId, {
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
											onUpdate={(userId) => {
												toast.promise(
													updateTask(id, projectId, {
														assignedToUser: userId,
													}),
													updateTaskToastOptions,
												);
											}}
										/>
									)}
								</dd>
							</div>
						</dl>
						<dl>
							<div className="py-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
								<dt className="text-sm font-medium leading-6">Due</dt>
								<dd className="mt-1 flex items-start text-sm leading-6 sm:col-span-2 sm:mt-0">
									{task.dueDate ? (
										<div className="flex w-full items-center justify-between">
											<p>{toDateStringWithDay(task.dueDate, timezone)}</p>
											<button
												type="button"
												className="text-primary hover:text-red-500"
												onClick={() => {
													toast.promise(
														updateTask(id, projectId, {
															dueDate: null,
														}),
														updateTaskToastOptions,
													);
												}}
											>
												Remove
											</button>
										</div>
									) : (
										<DateTimePicker
											dateOnly
											name="dueDate"
											onSelect={(dueDate) => {
												toast.promise(
													updateTask(id, projectId, {
														dueDate: toStartOfDay(dueDate),
													}),
													updateTaskToastOptions,
												);
											}}
										/>
									)}
								</dd>
							</div>
						</dl>
						<dl>
							<div className="py-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
								<dt className="text-sm font-medium leading-6">Notes</dt>
								<dd className="mt-1 flex items-start text-sm leading-6 sm:col-span-2 sm:mt-0">
									<TaskNotesForm task={task} />
								</dd>
							</div>
						</dl>
						{taskLists?.length ? (
							<dl>
								<div className="py-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
									<dt className="text-sm font-medium leading-6">Actions</dt>
									<dd className="mt-1 flex items-start space-x-2 text-sm leading-6 sm:col-span-2 sm:mt-0">
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
																action={() =>
																	moveTaskToTaskList(
																		task.id,
																		list.id,
																		projectId,
																	)
																}
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
													.map((list) => (
														<DropdownMenuItem key={list.id} className="w-full">
															<form
																className="w-full"
																action={() =>
																	copyTaskToTaskList(
																		task.id,
																		list.id,
																		projectId,
																	)
																}
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
									</dd>
								</div>
							</dl>
						) : null}
					</CardContent>
				</>
			) : (
				<>
					<Checkbox
						checked={status === "done"}
						className={cn(
							"my-4 ml-6 mr-1 transition-all",
							status === "done" ? "my-2.5 opacity-50" : "scale-125",
						)}
						onCheckedChange={async (checked) => {
							const status = checked ? "done" : "todo";
							updateOptimisticTask({ status });

							toast.promise(
								updateTask(id, projectId, { status }),
								updateTaskToastOptions,
							);
						}}
					/>
					<button
						type="button"
						className={cn(
							"text-md w-full py-1 text-left font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
							status === "done" ? "text-muted-foreground line-through" : "",
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
							{name}
							{task.dueDate ? (
								<span className="text-muted-foreground ml-2 text-sm">
									<CalendarClock className="h-4 w-4 inline-block text-primary mr-1 -mt-1" />
									<span className="hidden md:inline">
										{toDateStringWithDay(task.dueDate, timezone)}
									</span>
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
							<AlignJustifyIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
						</div>
					) : null}
				</>
			)}
		</Card>
	);
};

import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, or } from "drizzle-orm";
import { z } from "zod";
import { task, taskList } from "@/drizzle/schema";
import { TaskListStatus, TaskStatus } from "@/drizzle/types";
import { logActivity } from "@/lib/activity";
import { canEditProject, canViewProject } from "@/lib/permissions";
import { sendMentionNotifications } from "@/lib/utils/mentionNotifications";
import { notifyUser } from "@/lib/utils/useNotification";
import { createTRPCRouter, protectedProcedure } from "../init";

const POSITION_INCREMENT = 1000;

export const tasksRouter = createTRPCRouter({
	getTaskLists: protectedProcedure
		.input(
			z.object({
				projectId: z.number(),
				statuses: z
					.array(z.nativeEnum(TaskListStatus))
					.optional()
					.default([TaskListStatus.ACTIVE]),
			}),
		)
		.query(async ({ ctx, input }) => {
			const hasAccess = await canViewProject(ctx, input.projectId);
			if (!hasAccess) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Project access denied",
				});
			}

			const data = await ctx.db.query.taskList
				.findMany({
					where: and(
						eq(taskList.projectId, input.projectId),
						or(...input.statuses.map((status) => eq(taskList.status, status))),
					),
					with: {
						tasks: {
							orderBy: [asc(task.position)],
						},
					},
				})
				.execute();

			return data;
		}),
	createTaskList: protectedProcedure
		.input(
			z.object({
				projectId: z.number(),
				name: z.string().min(2, {
					message: "Name must be at least 2 characters.",
				}),
				description: z
					.string()
					.nullable()
					.transform((val) => (val?.trim()?.length ? val : null)),
				dueDate: z
					.string()
					.nullable()
					.optional()
					.transform((val) => (val?.trim()?.length ? new Date(val) : null)),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const canEdit = await canEditProject(ctx, input.projectId);
			if (!canEdit) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Project edit access denied",
				});
			}

			const createdTaskList = await ctx.db
				.insert(taskList)
				.values({
					name: input.name,
					description: input.description,
					dueDate: input.dueDate,
					status: TaskListStatus.ACTIVE,
					projectId: input.projectId,
					createdByUser: ctx.userId,
				})
				.returning();

			await logActivity({
				action: "created",
				type: "tasklist",
				projectId: input.projectId,
				newValue: createdTaskList[0],
			});

			if (createdTaskList?.[0] && input.description) {
				await sendMentionNotifications(input.description, {
					type: "tasklist",
					entityName: input.name,
					entityId: createdTaskList[0].id,
					projectId: input.projectId,
					orgSlug: ctx.orgSlug,
					fromUserId: ctx.userId,
				});
			}

			return createdTaskList?.[0];
		}),
	updateTaskList: protectedProcedure
		.input(
			z
				.object({
					id: z.number(),
					name: z.string().min(2, {
						message: "Name must be at least 2 characters.",
					}),
				})
				.or(
					z.object({
						id: z.number(),
						description: z
							.string()
							.nullable()
							.transform((val) => (val?.trim()?.length ? val : null)),
					}),
				)
				.or(
					z.object({
						id: z.number(),
						status: z
							.nativeEnum(TaskListStatus)
							.optional()
							.default(TaskListStatus.ACTIVE),
					}),
				)
				.or(
					z.object({
						id: z.number(),
						dueDate: z
							.string()
							.nullable()
							.optional()
							.transform((val) => (val?.trim()?.length ? new Date(val) : null)),
					}),
				),
		)
		.mutation(async ({ ctx, input }) => {
			const filteredInput = Object.fromEntries(
				Object.entries(input).filter(([key]) => key !== "id"),
			);

			const oldTaskList = await ctx.db.query.taskList.findFirst({
				where: eq(taskList.id, input.id),
			});

			if (!oldTaskList) {
				throw new Error("Task list not found");
			}

			const canEdit = await canEditProject(ctx, oldTaskList.projectId);
			if (!canEdit) {
				throw new Error(
					"You don't have permission to update task lists in this project",
				);
			}

			const data = await ctx.db
				.update(taskList)
				.set(filteredInput)
				.where(eq(taskList.id, input.id))
				.returning();

			if (oldTaskList) {
				await logActivity({
					action: "updated",
					type: "tasklist",
					projectId: oldTaskList.projectId,
					oldValue: oldTaskList,
					newValue: data[0],
				});

				if (data?.[0] && "description" in input && input.description) {
					await sendMentionNotifications(input.description, {
						type: "tasklist",
						entityName: oldTaskList.name,
						entityId: input.id,
						projectId: oldTaskList.projectId,
						orgSlug: ctx.orgSlug,
						fromUserId: ctx.userId,
					});
				}
			}

			return data?.[0];
		}),
	deleteTaskList: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			// First get the task list to check permissions
			const taskListToDelete = await ctx.db.query.taskList.findFirst({
				where: eq(taskList.id, input.id),
			});

			if (!taskListToDelete) {
				throw new Error("Task list not found");
			}

			const canEdit = await canEditProject(ctx, taskListToDelete.projectId);
			if (!canEdit) {
				throw new Error(
					"You don't have permission to delete task lists in this project",
				);
			}

			const data = await ctx.db
				.delete(taskList)
				.where(eq(taskList.id, input.id))
				.returning();

			if (data.length) {
				await logActivity({
					action: "deleted",
					type: "tasklist",
					projectId: data[0].projectId,
					oldValue: data[0],
				});
			}

			return data?.[0];
		}),
	getListById: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			const data = await ctx.db.query.taskList
				.findFirst({
					where: eq(taskList.id, +input.id),
					with: {
						tasks: {
							orderBy: [asc(task.position)],
							with: {
								creator: {
									columns: {
										firstName: true,
										imageUrl: true,
									},
								},
								assignee: {
									columns: {
										firstName: true,
										imageUrl: true,
									},
								},
							},
						},
					},
				})
				.execute();

			if (!data) {
				throw new Error(`TaskList with id ${input.id} not found`);
			}

			return data;
		}),

	createTask: protectedProcedure
		.input(
			z.object({
				name: z.string().optional().default(""),
				status: z.nativeEnum(TaskStatus).optional().default(TaskStatus.TODO),
				taskListId: z.number().optional().default(0),
				description: z.string().optional(),
				assignedToUser: z.string().nullable().optional(),
				dueDate: z
					.string()
					.nullable()
					.optional()
					.transform((val) => (val?.trim()?.length ? new Date(val) : null)),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Get the task list to find the project ID
			const taskListDetails = await ctx.db.query.taskList.findFirst({
				where: eq(taskList.id, input.taskListId),
				columns: {
					projectId: true,
				},
			});

			if (!taskListDetails) {
				throw new Error("Task list not found");
			}

			const canEdit = await canEditProject(ctx, taskListDetails.projectId);
			if (!canEdit) {
				throw new Error(
					"You don't have permission to add tasks to this project",
				);
			}

			const lastPosition = await ctx.db.query.task
				.findFirst({
					where: eq(task.taskListId, input.taskListId),
					orderBy: [desc(task.position)],
				})
				.execute();

			const position = lastPosition?.position
				? lastPosition?.position + POSITION_INCREMENT
				: 1;

			const createdTask = await ctx.db
				.insert(task)
				.values({
					...input,
					position,
					createdByUser: ctx.userId,
				})
				.returning();

			await logActivity({
				action: "created",
				type: "task",
				projectId: taskListDetails.projectId,
				newValue: createdTask[0],
			});

			if (createdTask?.[0] && input.description) {
				await sendMentionNotifications(input.description, {
					type: "task",
					entityName: input.name || "Untitled Task",
					entityId: createdTask[0].id,
					projectId: taskListDetails.projectId,
					orgSlug: ctx.orgSlug,
					fromUserId: ctx.userId,
				});
			}

			return createdTask?.[0];
		}),
	updateTask: protectedProcedure
		.input(
			z
				.object({
					id: z.number(),
					name: z.string().min(2, {
						message: "Name must be at least 2 characters.",
					}),
				})
				.or(
					z.object({
						id: z.number(),
						status: z.nativeEnum(TaskStatus),
					}),
				)
				.or(
					z.object({
						id: z.number(),
						description: z.string(),
					}),
				)
				.or(
					z.object({
						id: z.number(),
						assignedToUser: z.string().nullable(),
					}),
				)
				.or(
					z.object({
						id: z.number(),
						position: z.number(),
					}),
				)
				.or(
					z.object({
						id: z.number(),
						taskListId: z.number(),
					}),
				)
				.or(
					z.object({
						id: z.number(),
						dueDate: z
							.string()
							.nullable()
							.transform((val) => (val ? new Date(val) : null)),
					}),
				),
		)
		.mutation(async ({ ctx, input }) => {
			const filteredInput = Object.fromEntries(
				Object.entries(input).filter(([key]) => key !== "id"),
			);

			const oldTask = await ctx.db.query.task.findFirst({
				where: eq(task.id, input.id),
				with: {
					taskList: {
						columns: {
							projectId: true,
						},
					},
				},
			});

			if (!oldTask) {
				throw new Error("Task not found");
			}

			const canEdit = await canEditProject(ctx, oldTask.taskList.projectId);
			if (!canEdit) {
				throw new Error(
					"You don't have permission to update tasks in this project",
				);
			}

			const updatedTask = await ctx.db
				.update(task)
				.set(filteredInput)
				.where(eq(task.id, input.id))
				.returning();

			if (oldTask) {
				if (filteredInput.assignedToUser) {
					await notifyUser(
						filteredInput.assignedToUser,
						`${oldTask.name} has been assigned to you`,
						{
							type: "task",
							fromUser: ctx.userId,
							target: null,
						},
					);
				}

				await logActivity({
					action: "updated",
					type: "task",
					projectId: oldTask.taskList.projectId,
					oldValue: oldTask,
					newValue: updatedTask[0],
				});

				if (updatedTask?.[0] && "description" in input && input.description) {
					await sendMentionNotifications(input.description, {
						type: "task",
						entityName: oldTask.name,
						entityId: input.id,
						projectId: oldTask.taskList.projectId,
						orgSlug: ctx.orgSlug,
						fromUserId: ctx.userId,
					});
				}
			}

			return updatedTask?.[0];
		}),
	deleteTask: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const currentTask = await ctx.db.query.task.findFirst({
				where: eq(task.id, input.id),
				with: {
					taskList: {
						columns: {
							projectId: true,
						},
					},
				},
			});

			if (!currentTask) {
				throw new Error("Task not found");
			}

			const canEdit = await canEditProject(ctx, currentTask.taskList.projectId);
			if (!canEdit) {
				throw new Error(
					"You don't have permission to delete tasks in this project",
				);
			}

			await ctx.db.delete(task).where(eq(task.id, input.id)).returning();

			if (currentTask) {
				await logActivity({
					action: "deleted",
					type: "task",
					projectId: currentTask.taskList.projectId,
					oldValue: currentTask,
				});
			}

			return currentTask;
		}),
	tidyUpTaskList: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			// Get the task list to check permissions
			const taskListDetails = await ctx.db.query.taskList.findFirst({
				where: eq(taskList.id, input.id),
				columns: {
					projectId: true,
				},
			});

			if (!taskListDetails) {
				throw new Error("Task list not found");
			}

			const canEdit = await canEditProject(ctx, taskListDetails.projectId);
			if (!canEdit) {
				throw new Error(
					"You don't have permission to modify tasks in this project",
				);
			}

			const data = await ctx.db
				.update(task)
				.set({ status: TaskStatus.DELETED })
				.where(
					and(eq(task.taskListId, input.id), eq(task.status, TaskStatus.DONE)),
				)
				.returning();

			return data;
		}),
});

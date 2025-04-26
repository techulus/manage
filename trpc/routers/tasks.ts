import { task, taskList } from "@/drizzle/schema";
import { TaskListStatus, TaskStatus } from "@/drizzle/types";
import { logActivity } from "@/lib/activity";
import { notifyUser } from "@/lib/utils/useNotification";
import { and, asc, desc, eq, or } from "drizzle-orm";
import { z } from "zod";
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
						dueDate: z
							.string()
							.nullable()
							.optional()
							.transform((val) => (val?.trim()?.length ? new Date(val) : null)),
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
				),
		)
		.mutation(async ({ ctx, input }) => {
			const filteredInput = Object.fromEntries(
				Object.entries(input).filter(([key]) => key !== "id"),
			);

			const oldTaskList = await ctx.db.query.taskList.findFirst({
				where: eq(taskList.id, input.id),
			});

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
			}

			return data?.[0];
		}),
	deleteTaskList: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
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
			}),
		)
		.mutation(async ({ ctx, input }) => {
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

			const taskListDetails = await ctx.db.query.taskList.findFirst({
				where: eq(taskList.id, input.taskListId),
				columns: {
					projectId: true,
				},
			});

			if (taskListDetails) {
				await logActivity({
					action: "created",
					type: "task",
					projectId: taskListDetails.projectId,
					newValue: createdTask[0],
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
						dueDate: z
							.string()
							.nullable()
							.transform((val) => (val ? new Date(val) : null)),
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

import { task, taskList } from "@/drizzle/schema";
import { and, asc, desc, eq, or } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

const POSITION_INCREMENT = 1000;

export const tasksRouter = createTRPCRouter({
	getTaskLists: protectedProcedure
		.input(
			z.object({
				projectId: z.number(),
				statuses: z.array(z.string()).optional().default(["active"]),
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
	upsertTaskList: protectedProcedure
		.input(
			z.object({
				id: z.number().optional(),
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
				status: z.string().optional().default("active"),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (input.id) {
				const data = await ctx.db
					.update(taskList)
					.set({
						name: input.name,
						description: input.description,
						dueDate: input.dueDate,
						status: input.status,
					})
					.where(eq(taskList.id, input.id))
					.returning();
				return data;
			}

			const data = await ctx.db
				.insert(taskList)
				.values({
					name: input.name,
					description: input.description,
					dueDate: input.dueDate,
					status: input.status,
					projectId: input.projectId,
					createdByUser: ctx.userId,
				})
				.returning();

			return data;
		}),
	deleteTaskList: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const data = await ctx.db
				.delete(taskList)
				.where(eq(taskList.id, input.id))
				.returning({ name: taskList.name })
				.execute();

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
				status: z.enum(["todo", "done"]).optional().default("todo"),
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
						status: z.enum(["todo", "done"]),
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
						description: z.string().min(2, {
							message: "Description must be at least 2 characters.",
						}),
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

			const updatedTask = await ctx.db
				.update(task)
				.set(filteredInput)
				.where(eq(task.id, input.id))
				.returning();

			return updatedTask?.[0];
		}),
	deleteTask: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const data = await ctx.db
				.delete(task)
				.where(eq(task.id, input.id))
				.returning();

			return data?.[0];
		}),
});

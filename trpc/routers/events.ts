import { calendarEvent } from "@/drizzle/schema";
import { logActivity } from "@/lib/activity";
import { toEndOfDay } from "@/lib/utils/date";
import {
	getStartEndDateRangeInUtc,
	getStartEndWeekRangeInUtc,
} from "@/lib/utils/useEvents";
import { isAfter } from "date-fns";
import {
	and,
	asc,
	between,
	desc,
	eq,
	gt,
	isNotNull,
	lt,
	or,
} from "drizzle-orm";
import { Frequency, RRule } from "rrule";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

export const eventsRouter = createTRPCRouter({
	getById: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			const { id } = input;

			const event = await ctx.db.query.calendarEvent.findFirst({
				where: eq(calendarEvent.id, id),
				with: {
					creator: {
						columns: {
							id: true,
							firstName: true,
							imageUrl: true,
						},
					},
				},
			});

			return event;
		}),
	getByDate: protectedProcedure
		.input(
			z.object({
				date: z.date(),
				projectId: z.number(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { date, projectId } = input;
			const { startOfDay, endOfDay } = getStartEndDateRangeInUtc(
				ctx.timezone,
				date,
			);

			const events = await ctx.db.query.calendarEvent
				.findMany({
					where: and(
						eq(calendarEvent.projectId, +projectId),
						or(
							between(calendarEvent.start, startOfDay, endOfDay),
							between(calendarEvent.end, startOfDay, endOfDay),
							and(
								lt(calendarEvent.start, startOfDay),
								gt(calendarEvent.end, endOfDay),
							),
							isNotNull(calendarEvent.repeatRule),
							eq(calendarEvent.start, startOfDay),
							eq(calendarEvent.end, endOfDay),
						),
					),
					orderBy: [desc(calendarEvent.start), asc(calendarEvent.allDay)],
					with: {
						creator: {
							columns: {
								id: true,
								firstName: true,
								imageUrl: true,
							},
						},
					},
				})
				.execute();

			return events;
		}),
	getByWeek: protectedProcedure
		.input(
			z.object({
				projectId: z.number(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { projectId } = input;

			const { startOfWeek, endOfWeek } = getStartEndWeekRangeInUtc(
				ctx.timezone,
				new Date(),
			);

			const events = await ctx.db.query.calendarEvent
				.findMany({
					where: and(
						eq(calendarEvent.projectId, +projectId),
						or(
							between(calendarEvent.start, startOfWeek, endOfWeek),
							between(calendarEvent.end, startOfWeek, endOfWeek),
							and(
								lt(calendarEvent.start, startOfWeek),
								gt(calendarEvent.end, endOfWeek),
							),
							isNotNull(calendarEvent.repeatRule),
							eq(calendarEvent.start, startOfWeek),
							eq(calendarEvent.end, endOfWeek),
						),
					),
					orderBy: [desc(calendarEvent.start), asc(calendarEvent.allDay)],
					with: {
						creator: {
							columns: {
								id: true,
								firstName: true,
								imageUrl: true,
							},
						},
					},
				})
				.execute();

			return events;
		}),
	delete: protectedProcedure
		.input(
			z.object({
				id: z.number(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id } = input;

			const event = await ctx.db
				.delete(calendarEvent)
				.where(and(eq(calendarEvent.id, id)))
				.returning();

			if (event.length) {
				await logActivity({
					action: "deleted",
					type: "event",
					projectId: event[0].projectId,
					oldValue: event[0],
				});
			}
		}),
	upsert: protectedProcedure
		.input(
			z
				.object({
					id: z.number().optional(),
					projectId: z.number(),
					name: z
						.string()
						.min(2, { message: "Name must be at least 2 characters" }),
					description: z.string().optional(),
					start: z.date({ message: "Start date is required" }),
					end: z.date().optional(),
					allDay: z.boolean(),
					repeat: z.nativeEnum(Frequency).optional(),
					repeatUntil: z.date().optional(),
				})
				.refine((data) => (data.end ? isAfter(data.end, data.start) : true), {
					message: "End date must be after start date",
				}),
		)
		.mutation(async ({ ctx, input }) => {
			let {
				id,
				projectId,
				name,
				description,
				start,
				end,
				allDay,
				repeat,
				repeatUntil,
			} = input;

			if (allDay && end) {
				end = toEndOfDay(end);
			}

			let repeatRule: string | undefined;
			if (repeat) {
				repeatRule = new RRule({
					freq: repeat,
					dtstart: start,
					until: repeatUntil ? toEndOfDay(repeatUntil) : undefined,
					tzid: "UTC",
				}).toString();
			}

			const eventData = {
				name,
				description,
				start,
				end,
				allDay,
				repeatRule,
				projectId,
			};

			let eventId: number;

			if (id) {
				eventId = id;
				const oldEvent = await ctx.db.query.calendarEvent.findFirst({
					where: eq(calendarEvent.id, id),
				});

				const updatedEvent = await ctx.db
					.update(calendarEvent)
					.set(eventData)
					.where(eq(calendarEvent.id, id))
					.returning();

				await logActivity({
					action: "updated",
					type: "event",
					projectId,
					oldValue: oldEvent,
					newValue: updatedEvent[0],
				});
			} else {
				const newEvent = await ctx.db
					.insert(calendarEvent)
					.values({
						...eventData,
						createdByUser: ctx.userId,
					})
					.returning()
					.execute();

				eventId = newEvent[0].id;

				await logActivity({
					action: "created",
					type: "event",
					projectId,
					newValue: newEvent[0],
				});
			}

			return { id: eventId, ...eventData };
		}),
});

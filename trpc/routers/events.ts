import { calendarEvent, eventInvite } from "@/drizzle/schema";
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
					invites: {
						with: {
							user: {
								columns: {
									firstName: true,
									imageUrl: true,
								},
							},
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
						invites: {
							with: {
								user: {
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
						invites: {
							with: {
								user: {
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

			await ctx.db
				.delete(calendarEvent)
				.where(and(eq(calendarEvent.id, id)))
				.execute();
		}),
	upsert: protectedProcedure
		.input(
			z.object({
				id: z.number().optional(),
				projectId: z.number(),
				name: z.string(),
				description: z.string().optional(),
				start: z.date(),
				end: z.date().optional(),
				allDay: z.boolean(),
				repeat: z.nativeEnum(Frequency).optional(),
				repeatUntil: z.date().optional(),
				invites: z.array(z.string()).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const {
				id,
				projectId,
				name,
				description,
				start,
				end,
				allDay,
				repeat,
				repeatUntil,
				invites = [],
			} = input;

			if (end && isAfter(start, end)) {
				throw new Error("End date must be after start date");
			}

			let finalEnd = end;
			if (allDay && end) {
				finalEnd = toEndOfDay(end);
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
				end: finalEnd,
				allDay,
				repeatRule,
				projectId,
				updatedAt: new Date(),
			};

			let eventId: number;

			if (id) {
				await ctx.db
					.update(calendarEvent)
					.set(eventData)
					.where(eq(calendarEvent.id, id))
					.execute();

				eventId = id;

				await ctx.db
					.delete(eventInvite)
					.where(eq(eventInvite.eventId, id))
					.execute();
			} else {
				const result = await ctx.db
					.insert(calendarEvent)
					.values({
						...eventData,
						createdByUser: ctx.userId,
						createdAt: new Date(),
					})
					.returning({ id: calendarEvent.id })
					.execute();

				eventId = result[0].id;
			}

			for (const userId of invites) {
				await ctx.db
					.insert(eventInvite)
					.values({
						eventId,
						userId,
						status: "invited",
					})
					.execute();
			}

			return { id: eventId, ...eventData };
		}),
});

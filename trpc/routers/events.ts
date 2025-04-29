import { calendarEvent } from "@/drizzle/schema";
import { logActivity } from "@/lib/activity";
import { toEndOfDay, toStartOfDay, toTimeZone, toUTC } from "@/lib/utils/date";
import {
	getStartEndDateRangeInUtc,
	getStartEndMonthRangeInUtc,
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

const buildEventsQuery = (projectId: number, start: Date, end: Date) => {
	return {
		where: and(
			eq(calendarEvent.projectId, projectId),
			or(
				between(calendarEvent.start, start, end),
				between(calendarEvent.end, start, end),
				and(lt(calendarEvent.start, start), gt(calendarEvent.end, end)),
				isNotNull(calendarEvent.repeatRule),
				eq(calendarEvent.start, start),
				eq(calendarEvent.end, end),
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
	};
};

export const eventsRouter = createTRPCRouter({
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
				.findMany(buildEventsQuery(projectId, startOfDay, endOfDay))
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

			const { start, end } = getStartEndWeekRangeInUtc(
				ctx.timezone,
				new Date(),
			);

			const events = await ctx.db.query.calendarEvent
				.findMany(buildEventsQuery(projectId, start, end))
				.execute();

			return events;
		}),
	getByMonth: protectedProcedure
		.input(
			z.object({
				date: z.date().optional().default(new Date()),
				projectId: z.number(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { date, projectId } = input;

			const { start, end } = getStartEndMonthRangeInUtc(ctx.timezone, date);

			const events = await ctx.db.query.calendarEvent
				.findMany(buildEventsQuery(projectId, start, end))
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
					repeat: z.nativeEnum(Frequency).optional().nullable(),
					repeatUntil: z.date().optional().nullable(),
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

			if (allDay) {
				start = toUTC(
					toStartOfDay(toTimeZone(start, ctx.timezone)),
					ctx.timezone,
				);
				end = end
					? toUTC(toEndOfDay(toTimeZone(end, ctx.timezone)), ctx.timezone)
					: undefined;
			}

			let repeatRule: string | null = null;
			if (repeat) {
				repeatRule = new RRule({
					freq: repeat,
					dtstart: start,
					until: repeatUntil
						? toUTC(
								toEndOfDay(toTimeZone(repeatUntil, ctx.timezone)),
								ctx.timezone,
							)
						: undefined,
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

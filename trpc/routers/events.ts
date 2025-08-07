import { calendarEvent } from "@/drizzle/schema";
import { logActivity } from "@/lib/activity";
import { canEditProject, canViewProject } from "@/lib/permissions";
import {
	deleteSearchItem,
	indexEventWithProjectFetch,
} from "@/lib/search/helpers";
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
import { sendMentionNotifications } from "@/lib/utils/mentionNotifications";

const buildEventsQuery = (projectId: number, start: Date, end: Date) => {
	return {
		where: and(
			eq(calendarEvent.projectId, projectId),
			or(
				between(calendarEvent.start, start, end),
				between(calendarEvent.end, start, end),
				and(lt(calendarEvent.start, start), gt(calendarEvent.end, end)),
				and(
					isNotNull(calendarEvent.repeatRule),
					or(
						between(calendarEvent.start, start, end),
						lt(calendarEvent.start, start),
					),
				),
			),
		),
		orderBy: [desc(calendarEvent.allDay), asc(calendarEvent.start)],
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

			// Check if user has permission to view this project
			const hasAccess = await canViewProject(ctx.db, projectId, ctx.userId);
			if (!hasAccess) {
				throw new Error("Project access denied");
			}

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

			// Check if user has permission to view this project
			const hasAccess = await canViewProject(ctx.db, projectId, ctx.userId);
			if (!hasAccess) {
				throw new Error("Project access denied");
			}

			const now = new Date();
			const { end } = getStartEndWeekRangeInUtc(
				ctx.timezone,
				now,
			);

			const events = await ctx.db.query.calendarEvent
				.findMany(buildEventsQuery(projectId, now, end))
				.execute();

			return events;
		}),
	getByMonth: protectedProcedure
		.input(
			z.object({
				date: z
					.date()
					.optional()
					.default(() => new Date()),
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

			// First get the event to check permissions
			const existingEvent = await ctx.db.query.calendarEvent.findFirst({
				where: eq(calendarEvent.id, id),
			});

			if (!existingEvent) {
				throw new Error("Event not found");
			}

			// Check if user has edit permission for this project
			const canEdit = await canEditProject(
				ctx.db,
				existingEvent.projectId,
				ctx.userId,
			);
			if (!canEdit) {
				throw new Error("Project edit access denied");
			}

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

				await deleteSearchItem(ctx.search, `event-${id}`, "event");
			}

			return event[0];
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

			// Check if user has edit permission for this project
			const canEdit = await canEditProject(ctx.db, projectId, ctx.userId);
			if (!canEdit) {
				throw new Error("Project edit access denied");
			}

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

				if (updatedEvent?.[0]) {
					await indexEventWithProjectFetch(ctx.db, ctx.search, updatedEvent[0]);

					// Send mention notifications if description was updated
					if (description) {
						await sendMentionNotifications(description, {
							type: "event",
							entityName: name,
							entityId: id,
							projectId,
							orgSlug: ctx.orgSlug,
							fromUserId: ctx.userId,
						});
					}
				}
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

				if (newEvent?.[0]) {
					await indexEventWithProjectFetch(ctx.db, ctx.search, newEvent[0]);

					// Send mention notifications if description was provided
					if (description) {
						await sendMentionNotifications(description, {
							type: "event",
							entityName: name,
							entityId: eventId,
							projectId,
							orgSlug: ctx.orgSlug,
							fromUserId: ctx.userId,
						});
					}
				}
			}

			return { id: eventId, ...eventData };
		}),
});

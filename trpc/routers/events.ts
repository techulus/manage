import { calendarEvent } from "@/drizzle/schema";
import { getStartEndDateRangeInUtc } from "@/lib/utils/useEvents";
import { getTimezone } from "@/lib/utils/useOwner";
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
import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";

export const eventsRouter = createTRPCRouter({
	getByDate: baseProcedure
		.input(
			z.object({
				date: z.date(),
				projectId: z.number(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const timezone = await getTimezone();

			const { date, projectId } = input;
			const { startOfDay, endOfDay } = getStartEndDateRangeInUtc(
				timezone,
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
});

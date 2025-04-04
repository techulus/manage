import { SpinnerWithSpacing } from "@/components/core/loaders";
import PageSection from "@/components/core/section";
import PageTitle from "@/components/layout/page-title";
import { CommentsSection } from "@/components/project/comment/comments-section";
import EventsCalendar from "@/components/project/events/events-calendar";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { calendarEvent } from "@/drizzle/schema";
import { toDateStringWithDay } from "@/lib/utils/date";
import { database } from "@/lib/utils/useDatabase";
import { getStartEndDateRangeInUtc } from "@/lib/utils/useEvents";
import { getOwner, getTimezone } from "@/lib/utils/useOwner";
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
import { RssIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

type Props = {
	params: Promise<{
		projectId: string;
	}>;
	searchParams: Promise<{
		on: string;
	}>;
};

export default async function EventDetails(props: Props) {
	const searchParams = await props.searchParams;
	const params = await props.params;
	const { projectId } = params;
	const { on } = searchParams;
	const { userId, ownerId, orgSlug } = await getOwner();

	const timezone = await getTimezone();

	const selectedDate = on ? new Date(on) : new Date();
	const { startOfDay, endOfDay } = getStartEndDateRangeInUtc(
		timezone,
		selectedDate,
	);

	const dayCommentId = `${projectId}${selectedDate.getFullYear()}${selectedDate.getMonth()}${selectedDate.getDay()}`;

	const db = await database();
	const eventsPromise = db.query.calendarEvent
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

	const calendarSubscriptionUrl = `/api/calendar/${ownerId}/${projectId}/calendar.ics?userId=${userId}`;

	return (
		<>
			<PageTitle
				title="Events"
				actionLabel="New"
				actionLink={`/${orgSlug}/projects/${projectId}/events/new`}
				actionType="create"
			>
				<div className="font-medium text-gray-500">
					{toDateStringWithDay(selectedDate, timezone)}
				</div>
			</PageTitle>

			<PageSection topInset>
				<div className="flex justify-between p-1">
					{/* Left buttons */}
					<div className="isolate inline-flex sm:space-x-3">
						<span className="inline-flex space-x-1">
							<Link
								href={calendarSubscriptionUrl}
								className={buttonVariants({ variant: "link" })}
							>
								<RssIcon className="mr-2 h-5 w-5" />
								Calendar Subscription
							</Link>
						</span>
					</div>
				</div>
			</PageSection>

			<PageSection>
				<div className="flex w-full rounded-lg">
					<Suspense
						key={`events-${projectId}-${selectedDate.toISOString()}`}
						fallback={<SpinnerWithSpacing />}
					>
						<EventsCalendar
							projectId={projectId}
							userId={userId}
							eventsPromise={eventsPromise}
							events={[]}
							orgSlug={orgSlug}
							selectedDate={selectedDate.toISOString()}
							timezone={timezone}
						/>
					</Suspense>
				</div>
			</PageSection>

			<div className="mx-auto max-w-5xl p-4 lg:p-0">
				{/* @ts-ignore */}
				<CommentsSection
					type="event"
					parentId={dayCommentId}
					projectId={+projectId}
				/>
			</div>
		</>
	);
}

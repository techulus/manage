import { SpinnerWithSpacing } from "@/components/core/loaders";
import PageSection from "@/components/core/section";
import PageTitle from "@/components/layout/page-title";
import { CommentsSection } from "@/components/project/comment/comments-section";
import EventsCalendar from "@/components/project/events/events-calendar";
import { buttonVariants } from "@/components/ui/button";
import { toDateStringWithDay } from "@/lib/utils/date";
import { getOwner, getTimezone } from "@/lib/utils/useOwner";
import { caller } from "@/trpc/server";
import { RssIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

type Props = {
	params: Promise<{
		projectId: string;
		tenant: string;
	}>;
	searchParams: Promise<{
		on: string;
	}>;
};

export default async function EventDetails(props: Props) {
	const searchParams = await props.searchParams;
	const params = await props.params;
	const { projectId, tenant } = params;
	const { on } = searchParams;
	const { userId, ownerId } = await getOwner();

	const timezone = await getTimezone();
	const selectedDate = on ? new Date(on) : new Date();
	const events = await caller.events.getByDate({
		date: selectedDate,
		projectId: +projectId,
	});

	const dayCommentId = `${projectId}${selectedDate.getFullYear()}${selectedDate.getMonth()}${selectedDate.getDay()}`;
	const calendarSubscriptionUrl = `/api/calendar/${ownerId}/${projectId}/calendar.ics?userId=${userId}`;

	return (
		<>
			<PageTitle
				title="Events"
				actionLabel="New"
				actionLink={`/${tenant}/projects/${projectId}/events/new`}
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
							events={events}
							selectedDate={selectedDate.toISOString()}
							timezone={timezone}
						/>
					</Suspense>
				</div>
			</PageSection>

			<div className="mx-auto max-w-7xl p-4 lg:p-0">
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

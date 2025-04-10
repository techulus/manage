"use client";

import { SpinnerWithSpacing } from "@/components/core/loaders";
import PageSection from "@/components/core/section";
import PageTitle from "@/components/layout/page-title";
import { CommentsSection } from "@/components/project/comment/comments-section";
import EventsCalendar from "@/components/project/events/events-calendar";
import { buttonVariants } from "@/components/ui/button";
import { toDateStringWithDay } from "@/lib/utils/date";
import { useTRPC } from "@/trpc/client";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { RssIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { Suspense } from "react";

export default function EventDetails() {
	const { projectId, tenant } = useParams();
	const { user } = useUser();

	const [on] = useQueryState("on");

	const selectedDate = on ? new Date(on) : new Date();
	const dayCommentId = `${projectId}${selectedDate.getFullYear()}${selectedDate.getMonth()}${selectedDate.getDay()}`;
	const calendarSubscriptionUrl = `/api/calendar/${tenant}/${projectId}/calendar.ics?userId=${user?.id}`;

	const trpc = useTRPC();
	const { data: timezone, isLoading } = useQuery(
		trpc.settings.getTimezone.queryOptions(),
	);
	return (
		<>
			<PageTitle
				title="Events"
				actionLabel="New"
				actionLink={`/${tenant}/projects/${projectId}/events/new`}
			>
				<div className="font-medium text-gray-500">
					{isLoading ? null : toDateStringWithDay(selectedDate, timezone!)}
				</div>
			</PageTitle>

			<PageSection topInset>
				<div className="flex justify-between p-1">
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
							selectedDate={selectedDate.toISOString()}
							timezone={timezone!}
						/>
					</Suspense>
				</div>
			</PageSection>

			<div className="mx-auto max-w-7xl p-4 lg:p-0">
				<CommentsSection
					roomId={`project/${projectId}/event/${dayCommentId}`}
				/>
			</div>
		</>
	);
}

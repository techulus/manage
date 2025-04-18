"use client";

import { Panel } from "@/components/core/panel";
import PageSection from "@/components/core/section";
import EventForm from "@/components/form/event";
import PageTitle from "@/components/layout/page-title";
import { CommentsSection } from "@/components/project/comment/comments-section";
import EventsCalendar from "@/components/project/events/events-calendar";
import { buttonVariants } from "@/components/ui/button";
import { toDateStringWithDay } from "@/lib/utils/date";
import { useTRPC } from "@/trpc/client";
import { useSession } from "@clerk/nextjs";
import { Title } from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import { RssIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useMemo } from "react";

export default function EventDetails() {
	const { session } = useSession();
	if (!session) {
		return null;
	}

	const { projectId, tenant } = useParams();
	const { user, lastActiveOrganizationId } = session;

	const [on] = useQueryState("on");
	const [create, setCreate] = useQueryState(
		"create",
		parseAsBoolean.withDefault(false),
	);
	const [editing] = useQueryState("editing", parseAsBoolean.withDefault(false));
	const selectedDate = on ? new Date(on) : new Date();

	const dayCommentId = useMemo(
		() =>
			`${projectId}${selectedDate.getFullYear()}${selectedDate.getMonth()}${selectedDate.getDay()}`,
		[projectId, selectedDate],
	);
	const calendarSubscriptionUrl = useMemo(
		() =>
			`/api/calendar/${lastActiveOrganizationId ?? user?.id}/${projectId}/calendar.ics?userId=${user?.id}`,
		[lastActiveOrganizationId, projectId, user?.id],
	);

	const trpc = useTRPC();
	const { data: timezone, isLoading } = useQuery(
		trpc.settings.getTimezone.queryOptions(),
	);

	return (
		<>
			<PageTitle
				title="Events"
				actions={
					<Link
						href={`/${tenant}/projects/${projectId}/events?create=true`}
						className={buttonVariants()}
					>
						New
					</Link>
				}
			>
				<div className="font-medium text-gray-500">
					{isLoading ? null : toDateStringWithDay(selectedDate, timezone!)}
				</div>
			</PageTitle>

			<PageSection>
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
					<EventsCalendar timezone={timezone!} />
				</div>
			</PageSection>

			<div className="mx-auto max-w-7xl p-4 lg:p-0">
				<CommentsSection
					roomId={`project/${projectId}/event/${dayCommentId}`}
				/>
			</div>

			<Panel open={editing}>
				<Title>
					<PageTitle title="Edit Event" compact />
				</Title>
				<EventForm />
			</Panel>

			<Panel open={create} setOpen={setCreate}>
				<Title>
					<PageTitle title="Create Event" compact />
				</Title>
				<EventForm />
			</Panel>
		</>
	);
}

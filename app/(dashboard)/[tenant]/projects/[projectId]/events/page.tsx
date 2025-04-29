"use client";

import { Panel } from "@/components/core/panel";
import PageSection from "@/components/core/section";
import EventForm from "@/components/form/event";
import PageTitle from "@/components/layout/page-title";
import EventsList from "@/components/project/events/events-list";
import { FullCalendar } from "@/components/project/events/full-calendar";
import { Button, buttonVariants } from "@/components/ui/button";
import type { EventWithCreator } from "@/drizzle/types";
import { toDateString } from "@/lib/utils/date";
import { useTRPC } from "@/trpc/client";
import { useSession } from "@clerk/nextjs";
import { Title } from "@radix-ui/react-dialog";
import { useQueries } from "@tanstack/react-query";
import { RssIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useMemo, useState } from "react";

export default function Events() {
	const { session } = useSession();
	const { projectId } = useParams();
	const { user, lastActiveOrganizationId } = session ?? {};

	const [create, setCreate] = useQueryState(
		"create",
		parseAsBoolean.withDefault(false),
	);

	const [selectedDate, setSelectedDate] = useState<string | null>(null);

	const calendarSubscriptionUrl = useMemo(
		() =>
			`/api/calendar/${lastActiveOrganizationId ?? user?.id}/${projectId}/calendar.ics?userId=${user?.id}`,
		[lastActiveOrganizationId, projectId, user?.id],
	);

	const trpc = useTRPC();
	const [{ data: dayEvents = [] }, { data: timezone = "UTC" }] = useQueries({
		queries: [
			{
				...trpc.events.getByDate.queryOptions({
					projectId: +projectId!,
					date: new Date(selectedDate ?? new Date()),
				}),
				enabled: !!selectedDate,
			},
			trpc.settings.getTimezone.queryOptions(),
		],
	});

	return (
		<>
			<PageSection transparent className="pt-6 sm:pt-10 min-h-[70vh]">
				<FullCalendar
					projectId={+projectId!}
					timezone={timezone}
					onSelectDay={setSelectedDate}
				/>
			</PageSection>

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

			<Panel open={create} setOpen={setCreate}>
				<Title>
					<PageTitle title="New Event" compact />
				</Title>
				<EventForm />
			</Panel>

			<Panel open={selectedDate !== null}>
				<Title>
					{selectedDate ? (
						<PageTitle
							title={toDateString(new Date(selectedDate), timezone)}
							actions={
								<Button variant="outline" onClick={() => setSelectedDate(null)}>
									Close
								</Button>
							}
							compact
						/>
					) : null}
				</Title>
				<div className="w-full p-6">
					{selectedDate ? (
						<EventsList
							events={dayEvents as EventWithCreator[]}
							projectId={+projectId!}
							date={selectedDate}
							timezone={timezone}
						/>
					) : null}
				</div>
			</Panel>
		</>
	);
}

"use client";

import EmptyState from "@/components/core/empty-state";
import { HtmlPreview } from "@/components/core/html-view";
import { Panel } from "@/components/core/panel";
import { UserAvatar } from "@/components/core/user-avatar";
import { DeleteButton } from "@/components/form/button";
import EventForm from "@/components/form/event";
import PageTitle from "@/components/layout/page-title";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { EventWithCreator } from "@/drizzle/types";
import { cn } from "@/lib/utils";
import { displayMutationError } from "@/lib/utils/error";
import {
	eventToHumanReadableString,
	filterByRepeatRule,
} from "@/lib/utils/useEvents";
import { useTRPC } from "@/trpc/client";
import { useUser } from "@clerk/nextjs";
import { Title } from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleEllipsisIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function EventsList({
	date,
	projectId,
	events,
	compact,
	timezone,
}: {
	date: string;
	projectId: number;
	events: EventWithCreator[];
	timezone: string;
	compact?: boolean;
}) {
	const { user } = useUser();
	const { tenant } = useParams();
	const filteredEvents = events.filter((x) =>
		filterByRepeatRule(x, new Date(date), timezone),
	);

	const [editing, setEditing] = useState<number | null>(null);

	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const deleteEvent = useMutation(
		trpc.events.delete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.events.getByDate.queryKey({
						date: new Date(date),
						projectId,
					}),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.events.getByWeek.queryKey({
						projectId,
					}),
				});
			},
			onError: displayMutationError,
		}),
	);

	return (
		<div className="flex w-full flex-col space-y-2 divide-y">
			{!filteredEvents.length ? (
				<EmptyState
					show={!filteredEvents.length}
					label="event"
					createLink={`/${tenant}/projects/${projectId}/events?on=${date}&create=true`}
				/>
			) : null}

			{filteredEvents.map((event) => (
				<div
					key={event.id}
					className={cn("relative flex items-center justify-between")}
				>
					<div className="flex space-x-4 pt-1">
						<UserAvatar user={event.creator} className="mt-1" />
						<div className="flex-grow">
							<div className="text-lg font-semibold">{event.name}</div>
							<div
								className="pb-2 text-xs text-gray-500 dark:text-gray-400"
								suppressHydrationWarning
							>
								{eventToHumanReadableString(event, timezone)}
							</div>

							{event.description && !compact ? (
								<div className="pb-2">
									<HtmlPreview content={event.description ?? ""} />
								</div>
							) : null}

							{event.creator.id === user?.id ? (
								<DropdownMenu>
									<DropdownMenuTrigger className="absolute right-0 top-1.5">
										<CircleEllipsisIcon className="h-6 w-6" />
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem className="w-full p-0">
											<Button
												variant="ghost"
												className="w-full"
												size="sm"
												onClick={() => setEditing(event.id)}
											>
												Edit
											</Button>
										</DropdownMenuItem>
										<DropdownMenuItem className="w-full p-0">
											<form
												action={async () => {
													await deleteEvent.mutateAsync({
														id: event.id,
													});
												}}
												className="w-full"
											>
												<DeleteButton
													action="Delete"
													className="w-full"
													compact
												/>
											</form>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							) : null}
						</div>
					</div>
					<Panel open={editing === event.id}>
						<Title>
							<PageTitle title="Edit Event" compact />
						</Title>
						<EventForm item={event} setEditing={setEditing} />
					</Panel>
				</div>
			))}
		</div>
	);
}

"use client";

import EmptyState from "@/components/core/empty-state";
import { HtmlPreview } from "@/components/core/html-view";
import { UserAvatar } from "@/components/core/user-avatar";
import { DeleteButton } from "@/components/form/button";
import { buttonVariants } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { EventWithInvites } from "@/drizzle/types";
import { cn } from "@/lib/utils";
import {
	eventToHumanReadableString,
	filterByRepeatRule,
} from "@/lib/utils/useEvents";
import { useTRPC } from "@/trpc/client";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleEllipsisIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Assignee } from "../shared/assigee";

export default function EventsList({
	date,
	projectId,
	events,
	compact,
	timezone,
}: {
	date: string;
	projectId: number;
	events: EventWithInvites[];
	timezone: string;
	compact?: boolean;
}) {
	const { user } = useUser();
	const { tenant } = useParams();
	const filteredEvents = events.filter((x) =>
		filterByRepeatRule(x, new Date(date), timezone),
	);

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
		}),
	);

	return (
		<div className="flex w-full flex-col space-y-4">
			{!filteredEvents.length ? (
				<EmptyState
					show={!filteredEvents.length}
					label="event"
					createLink={`/${tenant}/projects/${projectId}/events/new?on=${date}`}
				/>
			) : null}

			{filteredEvents.map((event, idx) => (
				<div
					key={event.id}
					className={cn(
						"relative flex items-center justify-between border-b",
						idx === filteredEvents.length - 1 ? "border-b-0" : "",
					)}
				>
					<div className="flex space-x-4">
						<UserAvatar user={event.creator} />
						<div className="flex-grow">
							<div className="text-lg font-semibold">{event.name}</div>
							<div
								className="pb-2 text-xs text-gray-500 dark:text-gray-400"
								suppressHydrationWarning
							>
								{eventToHumanReadableString(event, timezone)}
							</div>

							{event.invites.length ? (
								<div className="my-2 flex space-x-2">
									{event.invites.map((invite) => (
										<div key={invite.userId} className="flex items-center">
											<Assignee user={invite.user} imageOnly={compact} />
										</div>
									))}
								</div>
							) : null}

							{event.description && !compact ? (
								<div className="pb-2">
									<HtmlPreview content={event.description ?? ""} />
								</div>
							) : null}

							{event.creator.id === user?.id ? (
								<DropdownMenu>
									<DropdownMenuTrigger className="absolute right-0 top-0">
										<CircleEllipsisIcon className="h-6 w-6" />
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem className="w-full p-0">
											<Link
												href={`/${tenant}/projects/${projectId}/events/${event.id}/edit`}
												className={buttonVariants({
													variant: "ghost",
													className: "w-full",
												})}
											>
												Edit
											</Link>
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
				</div>
			))}
		</div>
	);
}

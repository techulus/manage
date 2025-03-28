import { deleteEvent } from "@/app/(dashboard)/[tenant]/projects/[projectId]/events/actions";
import EmptyState from "@/components/core/empty-state";
import { MarkdownView } from "@/components/core/markdown-view";
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
import { CircleEllipsisIcon } from "lucide-react";
import Link from "next/link";
import { Assignee } from "../shared/assigee";

export default function EventsList({
	date,
	projectId,
	userId,
	events,
	compact,
	orgSlug,
	timezone,
}: {
	date: string;
	projectId: string;
	userId: string;
	orgSlug: string;
	events: EventWithInvites[];
	timezone: string;
	compact?: boolean;
}) {
	const filteredEvents = events.filter((x) =>
		filterByRepeatRule(x, new Date(date), timezone),
	);

	return (
		<div className="flex w-full flex-col space-y-4 p-4">
			{!filteredEvents.length ? (
				<EmptyState
					show={!filteredEvents.length}
					label="event"
					createLink={`/${orgSlug}/projects/${projectId}/events/new?on=${date}`}
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
									<MarkdownView content={event.description ?? ""} />
								</div>
							) : null}

							{event.creator.id === userId ? (
								<DropdownMenu>
									<DropdownMenuTrigger className="absolute right-0 top-0">
										<CircleEllipsisIcon className="h-6 w-6" />
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem className="w-full p-0">
											<Link
												href={`/${orgSlug}/projects/${projectId}/events/${event.id}/edit`}
												className={buttonVariants({
													variant: "ghost",
													className: "w-full",
												})}
												prefetch={false}
											>
												Edit
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem className="w-full p-0">
											<form action={deleteEvent} className="w-full">
												<input type="hidden" name="id" value={event.id} />
												<input
													type="hidden"
													name="projectId"
													value={event.projectId}
												/>
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

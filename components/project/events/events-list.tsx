import { deleteEvent } from "@/app/(dashboard)/console/projects/[projectId]/events/actions";
import EmptyState from "@/components/core/empty-state";
import { MarkdownView } from "@/components/core/markdown-view";
import { DeleteButton } from "@/components/form/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EventWithInvites } from "@/drizzle/types";
import { cn } from "@/lib/utils";
import { getEndOfDay, getStartOfDay } from "@/lib/utils/time";
import { CircleEllipsisIcon } from "lucide-react";
import Link from "next/link";
import { rrulestr } from "rrule";
import { Assignee } from "../shared/assigee";

const filterByRepeatRule = (event: EventWithInvites, date: Date) => {
  if (event.repeatRule) {
    const rrule = rrulestr(event.repeatRule);
    const start = new Date(getStartOfDay(date));
    const end = new Date(getEndOfDay(date));

    return rrule.between(start, end, true).length > 0;
  }

  return true;
};

export default function EventsList({
  date,
  projectId,
  userId,
  events,
  compact,
}: {
  date: string;
  projectId: string;
  userId: string;
  events: EventWithInvites[];
  compact?: boolean;
}) {
  const filteredEvents = events.filter((x) =>
    filterByRepeatRule(x, new Date(date))
  );

  return (
    <div className="flex w-full flex-col space-y-4 p-4">
      {!filteredEvents.length ? (
        <EmptyState
          show={!filteredEvents.length}
          label="event"
          createLink={`/console/projects/${projectId}/events/new`}
        />
      ) : null}

      {filteredEvents.map((event, idx) => (
        <div
          key={event.id}
          className={cn(
            "relative flex items-center justify-between border-b border-gray-200 dark:border-gray-800",
            idx === filteredEvents.length - 1 ? "border-b-0" : ""
          )}
        >
          <div className="flex space-x-4">
            {event.creator.imageUrl ? (
              <Avatar>
                <AvatarImage src={event.creator.imageUrl} />
                <AvatarFallback>
                  {event.creator?.firstName ?? "User"}
                </AvatarFallback>
              </Avatar>
            ) : null}
            <div className="flex-grow">
              <div className="text-lg font-semibold">{event.name}</div>
              <div
                className="pb-2 text-xs text-gray-500 dark:text-gray-400"
                suppressHydrationWarning
              >
                {event.allDay
                  ? event.start.toDateString()
                  : event.start.toLocaleString()}
                {event.end
                  ? ` - ${
                      event.allDay
                        ? event.end.toDateString()
                        : event.end.toLocaleString()
                    }`
                  : null}
                {event.repeatRule
                  ? `, ` + rrulestr(event.repeatRule).toText()
                  : null}
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
                <MarkdownView content={event.description ?? ""} />
              ) : null}

              {event.creator.id === userId ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="absolute right-0 top-0">
                    <CircleEllipsisIcon className="h-6 w-6" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="w-full p-0">
                      <Link
                        href={`/console/projects/${projectId}/events/${event.id}/edit`}
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

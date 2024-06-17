import { deleteEvent } from "@/app/(dashboard)/console/projects/[projectId]/events/actions";
import EmptyState from "@/components/core/empty-state";
import { MarkdownView } from "@/components/core/markdown-view";
import { DeleteButton } from "@/components/form/button";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EventWithCreator } from "@/drizzle/types";
import { cn } from "@/lib/utils";
import { getEndOfDay, getStartOfDay } from "@/lib/utils/time";
import { CircleEllipsisIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { rrulestr } from "rrule";

const filterByRepeatRule = (event: EventWithCreator, date: Date) => {
  if (event.repeatRule) {
    const rrule = rrulestr(event.repeatRule);
    const start = new Date(getStartOfDay(date));
    const end = new Date(getEndOfDay(date));

    return rrule.between(start, end, true).length > 0;
  }

  return true;
};

export default function EventsList({
  date = new Date().toISOString(),
  projectId,
  events,
  compact,
}: {
  date?: string;
  projectId: string;
  events: EventWithCreator[];
  compact?: boolean;
}) {
  const filteredEvents = events.filter((x) =>
    filterByRepeatRule(x, new Date(date))
  );

  return (
    <div className="flex w-full flex-col space-y-4 p-4">
      {!events.length ? (
        <EmptyState
          show={!events.length}
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
              <Image
                src={event.creator.imageUrl}
                alt={event.creator?.firstName ?? "User"}
                width={36}
                height={36}
                className="h-8 w-8 rounded-full"
              />
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
                {event.end ? ` - ${event.end.toLocaleString()}` : null}
                {event.repeatRule
                  ? `, ` + rrulestr(event.repeatRule).toText()
                  : null}
              </div>
              {event.description && !compact ? (
                <MarkdownView content={event.description ?? ""} />
              ) : null}

              <DropdownMenu>
                <DropdownMenuTrigger className="absolute right-0 top-0">
                  <CircleEllipsisIcon className="h-6 w-6" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem className="m-0 p-0">
                    <form action={deleteEvent}>
                      <input type="hidden" name="id" value={event.id} />
                      <Link
                        href={`/console/projects/${projectId}/events/${event.id}/edit`}
                        className={buttonVariants({
                          variant: "ghost",
                          className: "w-full",
                        })}
                      >
                        Edit
                      </Link>
                    </form>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="m-0 p-0">
                    <form action={deleteEvent}>
                      <input type="hidden" name="id" value={event.id} />
                      <DeleteButton
                        action="Delete"
                        className="w-full"
                        compact
                      />
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

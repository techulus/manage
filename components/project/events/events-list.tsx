import EmptyState from "@/components/core/empty-state";
import { MarkdownView } from "@/components/core/markdown-view";
import { EventWithCreator } from "@/drizzle/types";
import Image from "next/image";

export default function EventsList({
  projectId,
  events,
}: {
  projectId: string;
  events: EventWithCreator[];
}) {
  return (
    <div className="flex w-full flex-col space-y-4 p-4">
      {!events.length ? (
        <EmptyState
          show={!events.length}
          label="event"
          createLink={`/console/projects/${projectId}/events/new`}
        />
      ) : null}

      {events.map((event) => (
        <div
          key={event.id}
          className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center space-x-4">
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
                className="text-xs text-gray-500 dark:text-gray-400"
                suppressHydrationWarning
              >
                {event.start.toLocaleString()}
                {event.end ? ` - ${event.end.toLocaleString()}` : null}
              </div>
              {event.description ? (
                <MarkdownView content={event.description ?? ""} />
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

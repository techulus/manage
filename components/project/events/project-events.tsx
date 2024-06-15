"use client";

import { Calendar } from "@/components/ui/calendar";
import { EventWithCreator } from "@/drizzle/types";
import { useState } from "react";

export default function EventsCalendar({
  events,
}: {
  events: EventWithCreator[];
}) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="flex w-full flex-row space-x-4">
      <Calendar mode="single" selected={date} onSelect={setDate} />

      <div className="flex w-full flex-col space-y-4 p-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 flex-shrink-0 rounded-full bg-primary"></div>
              <div className="flex-grow">
                <div className="text-md font-medium">{event.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {event.start.toLocaleString()}
                  {event.end ? ` - ${event.end.toLocaleString()}` : null}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

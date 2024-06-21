"use client";

import { Calendar } from "@/components/ui/calendar";
import { EventWithInvites } from "@/drizzle/types";
import { useRouter } from "next/navigation";
import { DateTimePicker } from "./date-time-picker";
import EventsList from "./events-list";

export default function EventsCalendar({
  projectId,
  events,
  selectedDate = new Date().toISOString(),
  compact = false,
}: {
  projectId: string;
  events: EventWithInvites[];
  selectedDate?: string;
  compact?: boolean;
}) {
  const router = useRouter();

  return (
    <div className="flex w-full flex-col md:flex-row md:space-x-2">
      <div className="p-3 md:hidden">
        <DateTimePicker
          dateOnly
          defaultValue={selectedDate}
          name="date"
          onSelect={(date) => {
            router.push(
              `/console/projects/${projectId}/events?date=${date.toISOString()}`
            );
          }}
        />
      </div>

      <Calendar
        className="hidden md:block"
        mode="single"
        selected={new Date(selectedDate)}
        onDayClick={(date) => {
          router.push(
            `/console/projects/${projectId}/events?date=${date.toISOString()}`
          );
        }}
      />

      <EventsList
        events={events}
        projectId={projectId}
        date={selectedDate}
        compact={compact}
      />
    </div>
  );
}

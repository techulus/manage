"use client";

import { Calendar } from "@/components/ui/calendar";
import { EventWithCreator } from "@/drizzle/types";
import { useRouter } from "next/navigation";
import { DateTimePicker } from "./date-time-picker";
import EventsList from "./events-list";

export default function EventsCalendar({
  projectId,
  events,
}: {
  projectId: string;
  events: EventWithCreator[];
}) {
  const router = useRouter();

  return (
    <div className="flex w-full flex-col justify-center md:flex-row md:space-x-4">
      <div className="p-3 md:hidden">
        <DateTimePicker
          dateOnly
          defaultValue={new Date().toISOString()}
          name="date"
          onSelect={(date) => {
            router.push(
              `/console/projects/${projectId}/events?date=${date.toISOString()}`
            );
          }}
        />
      </div>

      <Calendar
        className="m-auto hidden md:block"
        mode="single"
        selected={new Date()}
        onDayClick={(date) => {
          router.push(
            `/console/projects/${projectId}/events?date=${date.toISOString()}`
          );
        }}
      />
      <EventsList events={events} projectId={projectId} compact />
    </div>
  );
}

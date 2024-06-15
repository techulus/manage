"use client";

import { Calendar } from "@/components/ui/calendar";
import { EventWithCreator } from "@/drizzle/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import EventsList from "./events-list";

export default function EventsCalendar({
  projectId,
  events,
}: {
  projectId: string;
  events: EventWithCreator[];
}) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const router = useRouter();

  return (
    <div className="flex w-full flex-row space-x-4">
      <Calendar
        mode="single"
        selected={date}
        onSelect={(date) => {
          if (!date) return;
          setDate(date);
          router.push(
            `/console/projects/${projectId}/events?date=${date.toISOString()}`
          );
        }}
      />
      <EventsList events={events} />
    </div>
  );
}

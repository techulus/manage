"use client";

import { Input } from "@/components/ui/input";
import { CalendarEvent } from "@/drizzle/types";
import { useState } from "react";
import { RRule } from "rrule";
import MarkdownEditor from "../editor";
import { DateTimePicker } from "../project/events/date-time-picker";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";

export default function EventForm({ item }: { item?: CalendarEvent | null }) {
  const [allDay, setAllDay] = useState(item?.allDay ?? false);

  const start = item?.start
    ? new Date(item.start)
    : new Date(new Date().setHours(new Date().getHours() + 1));

  const end = item?.end ? new Date(item.end) : undefined;

  return (
    <div className="my-2 space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 sm:pt-1.5 lg:text-left"
        >
          Name
        </label>
        <div className="mt-2 sm:col-span-2 sm:mt-0">
          <Input type="text" name="name" defaultValue={item?.name ?? ""} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col space-y-2">
          <Label>Start</Label>
          <DateTimePicker
            name="start"
            defaultValue={start.toISOString()}
            dateOnly={allDay}
          />
        </div>
        <div className="flex flex-col space-y-2">
          <Label>End</Label>
          <DateTimePicker
            name="end"
            defaultValue={end?.toISOString()}
            dateOnly={allDay}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col justify-center space-y-2">
          <Label htmlFor="all-day" className="flex items-center gap-2">
            <Switch
              name="allDay"
              id="all-day"
              aria-label="All day event"
              defaultChecked={item?.allDay ?? false}
              onCheckedChange={(checked) => setAllDay(checked)}
            />
            All Day Event
          </Label>
        </div>
        <div className="flex flex-col space-y-2">
          <Label htmlFor="repeat">Repeat</Label>
          <Select name="repeat">
            <SelectTrigger id="repeat">
              <SelectValue placeholder="Select repeat option" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value={String(RRule.DAILY)}>Daily</SelectItem>
              <SelectItem value={String(RRule.WEEKLY)}>Weekly</SelectItem>
              <SelectItem value={String(RRule.MONTHLY)}>Monthly</SelectItem>
              <SelectItem value={String(RRule.YEARLY)}>Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="markdownContent"
          className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 sm:pt-1.5 lg:text-left"
        >
          Description
        </label>
        <div className="mt-2 sm:col-span-2 sm:mt-0">
          <MarkdownEditor
            defaultValue={item?.description ?? ""}
            name="description"
          />
        </div>
      </div>
    </div>
  );
}

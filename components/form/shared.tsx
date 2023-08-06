"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DocumentFolder, Project, TaskList } from "@/drizzle/types";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "@heroicons/react/20/solid";
import { format } from "date-fns";
import { useState } from "react";
import MarkdownEditor from "../editor";

export default function SharedForm({
  item,
  showDueDate = true,
}: {
  item?: Project | TaskList | DocumentFolder | null;
  showDueDate?: boolean;
}) {
  const [date, setDate] = useState<Date>();

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

      <div className="space-y-2">
        <label
          htmlFor="description"
          className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 sm:pt-1.5 lg:text-left"
        >
          Notes
        </label>
        <div className="mt-2 sm:col-span-2 sm:mt-0">
          <MarkdownEditor defaultValue={item?.description ?? ""} />
        </div>
      </div>

      {showDueDate ? (
        <div className="py-2 sm:grid sm:grid-cols-3 sm:items-start sm:gap-4">
          <input type="hidden" name="dueDate" value={date?.toISOString()} />
          <label
            htmlFor="description"
            className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 sm:pt-1.5 lg:text-left"
          >
            Due on
          </label>
          <div className="mt-2 sm:col-span-2 sm:mt-0">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a due date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      ) : null}
    </div>
  );
}

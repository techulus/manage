"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "@heroicons/react/20/solid";
import { Project } from "@prisma/client";
import { format } from "date-fns";
import { useState } from "react";
import { Textarea } from "../ui/textarea";

export default function SharedForm({ project }: { project?: Project | null }) {
  const [date, setDate] = useState<Date>();

  return (
    <div className="pt-4 space-y-2 sm:space-y-3">
      <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 py-2">
        <label
          htmlFor="name"
          className="block lg:text-right text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 sm:pt-1.5"
        >
          Name
        </label>
        <div className="mt-2 sm:col-span-2 sm:mt-0">
          <Input type="text" name="name" defaultValue={project?.name ?? ""} />
        </div>
      </div>

      <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 py-2">
        <label
          htmlFor="description"
          className="block lg:text-right text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 sm:pt-1.5"
        >
          Notes
        </label>
        <div className="mt-2 sm:col-span-2 sm:mt-0">
          <Textarea
            name="description"
            defaultValue={project?.description ?? ""}
          />
        </div>
      </div>

      <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 py-2">
        <label
          htmlFor="description"
          className="block lg:text-right text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 sm:pt-1.5"
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
    </div>
  );
}

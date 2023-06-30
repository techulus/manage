"use client";

import { Input } from "@/components/ui/input";
import * as z from "zod";
import { Textarea } from "../ui/textarea";

export const projectSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  status: z.enum(["active", "archived"]),
});

export default function CreateProjectForm() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
        <label
          htmlFor="name"
          className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 sm:pt-1.5"
        >
          Name
        </label>
        <div className="mt-2 sm:col-span-2 sm:mt-0">
          <Input type="text" name="name" />
        </div>
      </div>

      <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
        <label
          htmlFor="description"
          className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 sm:pt-1.5"
        >
          Description
        </label>
        <div className="mt-2 sm:col-span-2 sm:mt-0">
          <Textarea name="description" />
        </div>
      </div>
    </div>
  );
}

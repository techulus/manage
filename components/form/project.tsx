"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import { Project } from "@prisma/client";

export default function ProjectForm({ project }: { project?: Project | null }) {
  return (
    <div className="pt-4 space-y-2 sm:space-y-3">
      <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 py-2">
        <label
          htmlFor="name"
          className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 sm:pt-1.5"
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
          className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 sm:pt-1.5"
        >
          Description
        </label>
        <div className="mt-2 sm:col-span-2 sm:mt-0">
          <Textarea
            name="description"
            defaultValue={project?.description ?? ""}
          />
        </div>
      </div>
    </div>
  );
}

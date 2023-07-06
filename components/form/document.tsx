"use client";

import { Input } from "@/components/ui/input";
import MarkdownEditor from "../editor";
import { Document } from "@prisma/client";

export default function DocumentForm({ item }: { item?: Document | null }) {
  return (
    <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
      <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 py-2">
        <label
          htmlFor="name"
          className="block lg:text-left text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 sm:pt-1.5"
        >
          Name
        </label>
        <div className="mt-2 sm:col-span-2 sm:mt-0">
          <Input type="text" name="name" defaultValue={item?.name ?? ""} />
        </div>
      </div>

      <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 py-2">
        <label
          htmlFor="description"
          className="block lg:text-left text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 sm:pt-1.5"
        >
          Content
        </label>
        <div className="mt-2 sm:col-span-2 sm:mt-0">
          <MarkdownEditor
            defaultValue={item?.markdownContent ?? ""}
            name="markdownContent"
          />
        </div>
      </div>
    </div>
  );
}

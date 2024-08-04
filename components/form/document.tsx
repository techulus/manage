"use client";

import { Input } from "@/components/ui/input";
import type { Document } from "@/drizzle/types";
import MarkdownEditor from "../editor";

export default function DocumentForm({ item }: { item?: Document | null }) {
  return (
    <div className="my-2 space-y-4">
      <div className="space-y-2">
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

      <div className="space-y-2">
        <label
          htmlFor="markdownContent"
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

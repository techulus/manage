"use client";

import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "../ui/button";
import { SaveButton } from "./button";

export default function InlineTaskForm() {
  const [isCreating, setIsCreating] = useState(false);

  if (!isCreating) {
    return (
      <Button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setIsCreating(true);
        }}
      >
        Add task
      </Button>
    );
  }

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
          <Input type="text" name="name" />
        </div>
        <SaveButton />
      </div>
    </div>
  );
}

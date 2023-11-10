"use client";

import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
// @ts-ignore
import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";
import { SaveButton } from "./button";
import { XMarkIcon } from "@heroicons/react/20/solid";

export default function InlineTaskForm() {
  const { pending } = useFormStatus();
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!pending) {
      setIsCreating(false);
    }
  }, [pending]);

  if (!isCreating) {
    return (
      <Button
        variant="outline"
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
    <div className="flex space-x-3">
      <div className="flex-grow max-w-xl">
        <Input type="text" name="name" defaultValue="" disabled={pending} />
      </div>
      <SaveButton />
      <Button
        type="button"
        variant="ghost"
        className="px-1 lg:px-2"
        onClick={() => setIsCreating(false)}
      >
        <XMarkIcon className="w-5 h-5" />
      </Button>
    </div>
  );
}

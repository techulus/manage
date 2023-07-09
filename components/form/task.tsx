"use client";

import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { experimental_useFormStatus as useFormStatus } from "react-dom";
import { Button } from "../ui/button";
import { SaveButton } from "./button";

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
      <div className="sm:col-span-2 sm:mt-0">
        <Input type="text" name="name" defaultValue="" disabled={pending} />
      </div>
      <SaveButton />
    </div>
  );
}

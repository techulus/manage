"use client";

import { updateTask } from "@/app/console/projects/[projectId]/tasklists/actions";
import { MarkdownView } from "@/components/core/markdown-view";
import MarkdownEditor from "@/components/editor";
import { Button } from "@/components/ui/button";
import { TaskWithDetails } from "@/drizzle/types";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function TaskNotesForm({ task }: { task: TaskWithDetails }) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(task?.description ?? "");

  if (isEditing)
    return (
      <div className="flex-grow">
        <MarkdownEditor defaultValue={notes} setValue={setNotes} />
        <Button
          className="mr-2"
          variant="secondary"
          onClick={() => {
            setIsEditing(false);
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            setIsEditing(false);

            toast.promise(updateTask(task.id, 1, { description: notes }), {
              loading: "Saving...",
              success: "Done!",
              error: "Error while saving, please try again.",
            });
          }}
        >
          Save
        </Button>
      </div>
    );

  return (
    <>
      <span className="flex-grow">
        <MarkdownView content={task.description ?? ""} />
      </span>
      <button
        type="button"
        className="rounded-md bg-white font-medium text-teal-600 hover:text-teal-500"
        onClick={() => setIsEditing(true)}
      >
        Update notes
      </button>
    </>
  );
}

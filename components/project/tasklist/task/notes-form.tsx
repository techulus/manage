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
    <div className="flex flex-grow flex-col items-start">
      {task.description ? (
        <span className="w-full rounded-md border border-muted p-2">
          <MarkdownView content={task.description ?? ""} />
        </span>
      ) : null}
      <Button
        variant="secondary"
        className="mt-2"
        onClick={() => setIsEditing(true)}
      >
        Update notes
      </Button>
    </div>
  );
}

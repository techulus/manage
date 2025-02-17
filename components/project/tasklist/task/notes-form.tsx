"use client";

import { updateTask } from "@/app/(dashboard)/[tenant]/projects/[projectId]/tasklists/actions";
import { MarkdownView } from "@/components/core/markdown-view";
import MarkdownEditor from "@/components/editor";
import { Button } from "@/components/ui/button";
import type { TaskWithDetails } from "@/drizzle/types";
import { useState } from "react";
import { toast } from "sonner";

export default function TaskNotesForm({ task }: { task: TaskWithDetails }) {
	const [isEditing, setIsEditing] = useState(false);
	const [notes, setNotes] = useState(task?.description ?? "");

	if (isEditing)
		return (
			<div className="flex-grow">
				<MarkdownEditor defaultValue={notes} setValue={setNotes} compact />
				<div className="mt-2">
					<Button
						className="mr-2"
						variant="ghost"
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
			</div>
		);

	return (
		<div className="flex flex-grow flex-col items-start">
			{task.description ? (
				<span className="w-full rounded-lg border border-muted p-2">
					<MarkdownView content={task.description ?? ""} />
				</span>
			) : null}
			<Button
				size="sm"
				variant="outline"
				className="text-primary"
				onClick={() => setIsEditing(true)}
			>
				Edit notes
			</Button>
		</div>
	);
}

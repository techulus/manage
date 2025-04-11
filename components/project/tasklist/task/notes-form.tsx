"use client";

import { HtmlPreview } from "@/components/core/html-view";
import Editor from "@/components/editor";
import { Button } from "@/components/ui/button";
import type { TaskWithDetails } from "@/drizzle/types";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function TaskNotesForm({ task }: { task: TaskWithDetails }) {
	const [isEditing, setIsEditing] = useState(false);

	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const updateTask = useMutation(
		trpc.tasks.updateTask.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.tasks.getListById.queryKey({ id: task.taskListId }),
				});
			},
		}),
	);

	if (isEditing)
		return (
			<form
				className="flex-grow"
				action={async (formData) => {
					await updateTask.mutateAsync({
						id: task.id,
						description: formData.get("description") as string,
					});
					setIsEditing(false);
				}}
			>
				<Editor defaultValue={task.description ?? ""} />
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
					<Button type="submit">Save</Button>
				</div>
			</form>
		);

	return (
		<div className="flex flex-grow flex-col items-start">
			{task.description ? (
				<span className="w-full rounded-lg border border-muted p-2">
					<HtmlPreview content={task.description ?? ""} />
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

"use client";

import { HtmlPreview } from "@/components/core/html-view";
import Editor from "@/components/editor";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Spinner } from "../core/loaders";

export default function NotesForm({
	value,
	name,
}: {
	value: string | null | undefined;
	name: string;
}) {
	const { pending } = useFormStatus();
	const [isEditing, setIsEditing] = useState(false);

	useEffect(() => {
		if (!pending) {
			setIsEditing(false);
		}
	}, [pending]);

	if (isEditing)
		return (
			<div className="flex-grow">
				<Editor defaultValue={value ?? ""} name={name} allowImageUpload />
				<div className="mt-2">
					<Button
						type="button"
						className="mr-2"
						variant="ghost"
						onClick={() => {
							setIsEditing(false);
						}}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={pending}>
						{pending ? <Spinner /> : "Save"}
					</Button>
				</div>
			</div>
		);

	return (
		<div className="flex flex-grow flex-col items-start">
			{value ? (
				<span className="w-full">
					<HtmlPreview content={value ?? ""} />
				</span>
			) : null}
			<Button
				size="sm"
				variant="outline"
				className="text-primary"
				onClick={() => setIsEditing(true)}
			>
				<Edit className="w-4 h-4" />
				Notes
			</Button>
		</div>
	);
}

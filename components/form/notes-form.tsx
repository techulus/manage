"use client";

import type { PartialBlock } from "@blocknote/core";
import { Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { HtmlPreview } from "@/components/core/html-view";
import Editor from "@/components/editor";
import { Button } from "@/components/ui/button";
import { Spinner } from "../core/loaders";

export default function NotesForm({
	value,
	name,
	metadata,
}: {
	value: string | null | undefined;
	name: string;
	metadata?: PartialBlock[] | undefined;
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
				<Editor
					defaultValue={value ?? ""}
					name={name}
					metadata={metadata}
					allowImageUpload
				/>
				<div className="mt-2">
					<Button
						type="button"
						className="mr-2"
						variant="ghost"
						size="sm"
						onClick={() => {
							setIsEditing(false);
						}}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={pending} size="sm">
						{pending ? <Spinner className="text-muted" /> : "Save"}
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
			<Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
				<Edit className="w-4 h-4 text-primary" />
				Notes
			</Button>
		</div>
	);
}

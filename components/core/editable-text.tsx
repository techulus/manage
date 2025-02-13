"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ActionButton } from "../form/button";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export type ResultWithOptionalError = { error?: string; success: boolean };

export function EditableValue({
	id,
	name,
	value,
	action,
	type,
}: {
	id: string | number;
	name: string;
	value: string | number;
	type: "text" | "number";
	action: (data: FormData) => Promise<ResultWithOptionalError>;
}) {
	const [isEditing, setIsEditing] = useState(false);
	const [localValue, setLocalValue] = useState(value);

	return (
		<form
			action={async (formData: FormData) => {
				try {
					const result = await action(formData);
					if (result?.error) {
						toast.error(result.error);
					} else {
						toast.success("Updated successfully");
					}
				} finally {
					setIsEditing(false);
				}
			}}
		>
			<input type="hidden" name="id" value={id} />
			<input type="hidden" name="key" value={name} />
			{isEditing ? (
				<div className="flex space-x-2">
					<Input
						name={name}
						type={type}
						value={localValue}
						onChange={(e) => setLocalValue(e.target.value)}
						className="w-auto max-w-[160px]"
					/>
					<ActionButton label="Save" />
				</div>
			) : (
				<div className="flex items-center">
					<p>{value}</p>
					<Button
						type="button"
						variant="link"
						onClick={() => setIsEditing(true)}
					>
						Edit
					</Button>
				</div>
			)}
		</form>
	);
}

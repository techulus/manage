"use client";

import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
// @ts-ignore
import { useFormStatus } from "react-dom";
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
				type="button"
				size="sm"
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
			<div className="max-w-xl flex-grow">
				<Input type="text" name="name" defaultValue="" disabled={pending} />
			</div>
			<SaveButton />
			<Button
				type="button"
				variant="ghost"
				className="px-1 lg:px-2"
				onClick={() => setIsCreating(false)}
			>
				<X className="h-5 w-5" />
			</Button>
		</div>
	);
}

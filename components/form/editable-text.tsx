"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Edit, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "../core/loaders";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export default function EditableText({
	value,
	onChange,
	textClassName = "",
	type = "text",
	label,
}: {
	value: string;
	onChange: (value: string) => Promise<void> | void;
	textClassName?: string;
	type?: "text" | "number";
	label: string;
}) {
	const [isEditing, setIsEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [inputValue, setInputValue] = useState(value);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleSave = useCallback(async () => {
		if (isSaving) return;
		setIsSaving(true);
		await onChange(inputValue);
		setIsSaving(false);
		setIsEditing(false);
	}, [isSaving, onChange, inputValue]);

	return (
		<Dialog.Root open={isEditing} onOpenChange={setIsEditing}>
			<Dialog.Trigger asChild>
				<button
					type="button"
					className={cn(
						"outline-none hover:bg-muted p-1 px-2 rounded-md -mx-2 group flex items-center gap-1",
						textClassName,
					)}
				>
					<span>{value}</span>
					<Edit className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity ml-1.5" />
				</button>
			</Dialog.Trigger>

			<Dialog.Portal>
				<Dialog.Overlay
					className={cn(
						"fixed inset-0 z-50 bg-muted/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
					)}
				/>
				<Dialog.Content
					onOpenAutoFocus={(e) => {
						e.preventDefault();
						if (inputRef.current) {
							inputRef.current.focus();
							inputRef.current.select();
						}
					}}
					className={cn(
						"fixed left-[50%] top-[30%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] p-4",
					)}
				>
					<Dialog.Title className="p-2 bg-background rounded-md text-sm font-semibold inline-block">
						Update {label}
					</Dialog.Title>
					<div className="relative px-3 py-2 mt-2 bg-background rounded-md space-y-2">
						<Dialog.Close asChild className="absolute right-0 top-1 -mt-12">
							<Button type="button" variant="ghost">
								<X className="w-5 h-5 text-primary" />
							</Button>
						</Dialog.Close>

						<Input
							ref={inputRef}
							type={type}
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleSave();
								}
							}}
						/>

						<div className="flex justify-end">
							<Button type="button" disabled={isSaving} onClick={handleSave}>
								{isSaving ? <Spinner /> : "Save"}
							</Button>
						</div>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

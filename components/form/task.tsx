"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { Button } from "../ui/button";

export default function InlineTaskForm({
	action,
}: {
	action: (name: string) => Promise<void>;
}) {
	const [isCreating, setIsCreating] = useState(false);
	const [value, setValue] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	useKeyboardShortcut("n", () => setIsCreating(true));

	const handleSubmit = useCallback(async () => {
		await action(value);
		setValue("");
		setIsCreating(false);
	}, [action, value]);

	return (
		<Dialog.Root open={isCreating} onOpenChange={setIsCreating}>
			<Dialog.Trigger asChild>
				<Button
					type="button"
					size="sm"
					onClick={(e) => {
						e.preventDefault();
						setIsCreating(true);
					}}
					className="flex items-center gap-2"
					aria-keyshortcuts="N"
				>
					Add task
					<Kbd className="hidden md:inline-flex">N</Kbd>
				</Button>
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
						}
					}}
					className={cn(
						"fixed left-[50%] top-[30%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] p-4",
					)}
				>
					<Dialog.Title className="p-2 bg-background rounded-md text-sm font-semibold inline-block">
						Create Task
					</Dialog.Title>
					<div className="relative px-3 py-2 mt-2 bg-background rounded-md space-y-2">
						<Dialog.Close asChild className="absolute right-0 top-1 -mt-12">
							<Button type="button" variant="ghost">
								<X className="w-5 h-5 text-primary" />
							</Button>
						</Dialog.Close>

						<Input
							ref={inputRef}
							name="name"
							type="text"
							value={value}
							onChange={(e) => setValue(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleSubmit();
								}
							}}
						/>

						<div className="flex justify-end">
							<Button type="button" onClick={handleSubmit}>
								Save
							</Button>
						</div>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

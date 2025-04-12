"use client";

import { cn } from "@/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";

export function Panel({
	open,
	setOpen,
	children,
}: {
	open: boolean;
	setOpen?: (open: boolean) => void;
	children: React.ReactNode;
}) {
	return (
		<Dialog.Root open={open} onOpenChange={setOpen} modal={false}>
			<Dialog.Portal>
				<Dialog.Content
					className={cn(
						"fixed top-28 bottom-0 right-0 w-full md:max-w-[720px] bg-background shadow-lg flex flex-col sm:rounded-tl-lg border z-50",
						"data-[state=open]:animate-in data-[state=open]:slide-in-from-right duration-300 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right",
					)}
				>
					{children}
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

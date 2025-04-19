"use client";

import { cn } from "@/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";
import { memo } from "react";

export const Panel = memo(function Panel({
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
						"fixed top-24 bottom-0 right-0 w-full md:max-w-[720px] bg-background/80 backdrop-blur-xl shadow-lg flex flex-col rounded-tl-lg rounded-tr-lg sm:rounded-tr-none sm:border-l border-t z-50",
						"data-[state=open]:animate-in data-[state=open]:slide-in-from-right duration-300 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right",
					)}
				>
					{children}
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
});

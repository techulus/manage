"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";
import { memo } from "react";

export const Panel = memo(function Panel({
	open,
	setOpen,
	children,
	className,
}: {
	open: boolean;
	setOpen?: (open: boolean) => void;
	children: React.ReactNode;
	className?: string;
}) {
	const isMobile = useIsMobile();

	return (
		<Dialog.Root open={open} onOpenChange={setOpen} modal={false}>
			<Dialog.Portal>
				<Dialog.Content
					className={cn(
						"fixed top-24 bottom-0 right-0 w-full md:max-w-[50vw] bg-background/80 backdrop-blur-xl shadow-lg flex flex-col rounded-tl-lg rounded-tr-lg sm:rounded-tr-none sm:border-l border-t z-50",
						"duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out",
						isMobile
							? "data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom"
							: "data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
						className,
					)}
				>
					{children}
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
});

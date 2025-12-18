"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { memo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export const Panel = memo(function Panel({
	open,
	setOpen,
	children,
	className,
	title = "Panel",
}: {
	open: boolean;
	setOpen?: (open: boolean) => void;
	children: React.ReactNode;
	className?: string;
	title?: string;
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
					<VisuallyHidden>
						<Dialog.Title>{title}</Dialog.Title>
					</VisuallyHidden>
					{children}
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
});

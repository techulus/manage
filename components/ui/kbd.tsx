import { cn } from "@/lib/utils";
import * as React from "react";

const Kbd = React.forwardRef<
	HTMLElement,
	React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
	<kbd
		ref={ref}
		className={cn(
			"pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100",
			className,
		)}
		{...props}
	/>
));
Kbd.displayName = "Kbd";

export { Kbd };
import { cn } from "@/lib/utils";

export default function PageSection({
	children,
	className,
	bottomMargin = true,
	title,
	titleClassName,
	titleIcon,
	titleAction,
	transparent = false,
}: {
	children: React.ReactNode;
	className?: string;
	bottomMargin?: boolean;
	title?: string;
	titleClassName?: string;
	titleIcon?: React.ReactNode;
	titleAction?: React.ReactNode;
	transparent?: boolean;
}) {
	return (
		<>
			{title && (
				<h3
					className={cn(
						"mx-4 flex max-w-7xl items-center p-2 font-medium xl:mx-auto text-primary",
						titleClassName,
					)}
				>
					{titleIcon ? <span className="mr-1">{titleIcon}</span> : null}
					{title}
					{titleAction ? <span className="ml-auto">{titleAction}</span> : null}
				</h3>
			)}
			<div
				className={cn(
					"mx-4 flex max-w-7xl flex-col divide-y dark:divide-white/10 rounded-lg bg-muted xl:mx-auto",
					transparent ? "bg-transparent divide-none" : "",
					bottomMargin ? "mb-6" : "",
					className,
				)}
			>
				{children}
			</div>
		</>
	);
}

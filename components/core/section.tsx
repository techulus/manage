import { cn } from "@/lib/utils";

export default function PageSection({
	children,
	className,
	bottomMargin = true,
}: {
	children: React.ReactNode;
	className?: string;
	bottomMargin?: boolean;
}) {
	return (
		<div
			className={cn(
				"mx-4 flex max-w-7xl flex-col divide-y rounded-lg border bg-card xl:mx-auto",
				bottomMargin ? "mb-6" : "",
				className,
			)}
		>
			{children}
		</div>
	);
}

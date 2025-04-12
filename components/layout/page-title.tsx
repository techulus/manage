import { cn } from "@/lib/utils";
import Link from "next/link";
import type { JSX, PropsWithChildren } from "react";
import { buttonVariants } from "../ui/button";

interface Props {
	title: string;
	subTitle?: string;
	actionLink?: string;
	actionLabel?: string;
	actions?: JSX.Element;
	compact?: boolean;
}

export default function PageTitle({
	title,
	subTitle,
	actionLink,
	actionLabel,
	children,
	actions,
	compact = false,
}: PropsWithChildren<Props>) {
	return (
		<>
			<div
				className={cn(
					"flex min-h-[180px] items-center justify-center pb-4 pl-4 pr-6 pt-4 sm:pl-6 lg:pl-8 xl:border-t-0",
					compact ? "min-h-0 h-[80px] overflow-y-auto pb-0 pl-0" : "",
				)}
			>
				<div className="flex w-full max-w-7xl items-center justify-between">
					<div className={cn("relative flex w-full flex-col")}>
						<h1 className="text-hero flex-1 text-3xl tracking-tighter lg:text-4xl">
							{title}
						</h1>
						{subTitle ? (
							<p className="text-gray-500 dark:text-gray-400">{subTitle}</p>
						) : null}
						<div className="block w-full pt-2">{children}</div>
					</div>

					{actionLink && actionLabel ? (
						<Link href={actionLink} className={buttonVariants()}>
							{actionLabel}
						</Link>
					) : null}

					{actions ?? null}
				</div>
			</div>
		</>
	);
}

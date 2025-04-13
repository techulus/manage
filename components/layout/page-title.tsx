import { cn } from "@/lib/utils";
import type { JSX, PropsWithChildren } from "react";
import EditableText from "../form/editable-text";

interface Props {
	title: string;
	subTitle?: string;
	actions?: JSX.Element;
	compact?: boolean;
	editableTitle?: boolean;
	titleOnChange?: (title: string) => Promise<void>;
}

export default function PageTitle({
	title,
	subTitle,
	children,
	actions,
	compact = false,
	editableTitle = false,
	titleOnChange,
}: PropsWithChildren<Props>) {
	return (
		<>
			<div
				className={cn(
					"flex min-h-[160px] items-center justify-center pb-4 pl-4 pr-6 pt-4 sm:pl-6 xl:border-t-0",
					compact ? "min-h-0 h-[80px] overflow-y-auto pb-0" : "",
				)}
			>
				<div className="flex w-full max-w-7xl items-center justify-between">
					<div className={cn("relative flex w-full flex-col")}>
						<h1
							className={cn(
								"text-hero flex-1 text-3xl tracking-tighter lg:text-4xl",
								compact ? "text-lg lg:text-2xl" : "",
							)}
						>
							{editableTitle ? (
								<EditableText
									value={title}
									label="name"
									textClassName="tracking-tighter"
									onChange={async (val) => {
										await titleOnChange?.(val);
									}}
								/>
							) : (
								title
							)}
						</h1>
						{subTitle ? (
							<p className="text-gray-500 dark:text-gray-400">{subTitle}</p>
						) : null}
						<div className="block w-full pt-2">{children}</div>
					</div>

					{actions ?? null}
				</div>
			</div>
		</>
	);
}

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import type { PropsWithChildren } from "react";
import { buttonVariants } from "../ui/button";

interface Props {
	title: string;
	subTitle?: string;
	actionLink?: string;
	actionLabel?: string;
	backUrl?: string;
	actions?: JSX.Element;
}

export default function PageTitle({
	title,
	subTitle,
	backUrl,
	actionLink,
	actionLabel,
	children,
	actions,
}: PropsWithChildren<Props>) {
	return (
		<div className="flex min-h-[200px] items-center justify-center border-b bg-gray-50 pb-4 pl-4 pr-6 pt-4 dark:bg-card dark:bg-gray-900 dark:text-white sm:pl-6 lg:pl-8 xl:border-t-0">
			<div className="flex w-full max-w-5xl items-center justify-between">
				<div className="relative flex w-full flex-col">
					{backUrl ? (
						<Link
							href={backUrl}
							className="text-md absolute -top-6 left-0 -ml-2 mr-2 flex w-[76px] items-center rounded-md p-0.5 px-2 font-medium text-gray-600 hover:bg-gray-200 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
							prefetch={false}
						>
							<ArrowLeftIcon
								className="h-4 w-4 flex-shrink-0"
								aria-hidden="true"
							/>
							<span className="ml-1">Back</span>
						</Link>
					) : null}

					<h1 className="text-hero flex-1 text-3xl font-bold tracking-tight lg:text-4xl">
						{title}
					</h1>
					{subTitle ? (
						<p className="text-gray-500 dark:text-gray-400">{subTitle}</p>
					) : null}
					<div className="block w-full pt-2">{children}</div>
				</div>

				{actionLink && actionLabel ? (
					<Link href={actionLink} className={buttonVariants()} prefetch={false}>
						{actionLabel}
					</Link>
				) : null}

				{actions ?? null}
			</div>
		</div>
	);
}

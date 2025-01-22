"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { type JSX, type PropsWithChildren, useEffect, useState } from "react";
import { createToastWrapper } from "../core/toast";
import { buttonVariants } from "../ui/button";

interface Props {
	title: string;
	subTitle?: string;
	actionLink?: string;
	actionLabel?: string;
	actions?: JSX.Element;
}

export default function PageTitle({
	title,
	subTitle,
	actionLink,
	actionLabel,
	children,
	actions,
}: PropsWithChildren<Props>) {
	const { systemTheme: theme } = useTheme();

	const [isSticky, setIsSticky] = useState(false);
	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > 100) {
				setIsSticky(true);
			} else {
				setIsSticky(false);
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	return (
		<>
			{createToastWrapper(theme)}

			<div
				className={`fixed top-0 left-0 right-0 z-50 bg-gray-50 dark:bg-card dark:bg-gray-900 dark:text-white sm:hidden border-b transition-opacity duration-300 ${isSticky ? "opacity-100" : "opacity-0"}`}
			>
				<div className="flex w-full max-w-5xl items-center justify-between p-2">
					<h1 className="w-full text-md font-semibold text-center tracking-tight">
						{title}
					</h1>
				</div>
			</div>

			<div className="flex min-h-[240px] items-center justify-center border-b bg-gray-50 pb-4 pl-4 pr-6 pt-4 dark:bg-card dark:bg-gray-900 dark:text-white sm:pl-6 lg:pl-8 xl:border-t-0">
				<div className="flex w-full max-w-5xl items-center justify-between">
					<div className="relative flex w-full flex-col">
						<h1 className="text-hero flex-1 text-3xl tracking-tighter lg:text-4xl">
							{title}
						</h1>
						{subTitle ? (
							<p className="text-gray-500 dark:text-gray-400">{subTitle}</p>
						) : null}
						<div className="block w-full pt-2">{children}</div>
					</div>

					{actionLink && actionLabel ? (
						<Link
							href={actionLink}
							className={buttonVariants()}
							prefetch={false}
						>
							{actionLabel}
						</Link>
					) : null}

					{actions ?? null}
				</div>
			</div>
		</>
	);
}

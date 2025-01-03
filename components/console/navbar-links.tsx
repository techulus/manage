"use client";

import { useDetectSticky } from "@/lib/hooks/useDetectSticky";
import { cn } from "@/lib/utils";
import { Transition } from "@headlessui/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useMemo } from "react";
import logo from "../../public/images/logo.png";
import { createToastWrapper } from "../core/toast";

export default function NavBarLinks() {
	const { systemTheme: theme } = useTheme();
	const path = usePathname();
	const { projectId } = useParams();
	const orgSlug = "personal";

	const [isSticky, ref] = useDetectSticky();

	const tabs = useMemo(() => {
		return projectId
			? [
					{
						name: "Overview",
						href: `/${orgSlug}/projects/${projectId}`,
						current: path.endsWith(`/projects/${projectId}`),
					},
					{
						name: "Task Lists",
						href: `/${orgSlug}/projects/${projectId}/tasklists`,
						current: path.includes(`/projects/${projectId}/tasklists`),
					},
					{
						name: "Docs & Files",
						href: `/${orgSlug}/projects/${projectId}/documents`,
						current: path.includes(`/projects/${projectId}/documents`),
					},
					{
						name: "Events",
						href: `/${orgSlug}/projects/${projectId}/events`,
						current: path.includes(`/projects/${projectId}/events`),
					},
					{
						name: "Activity",
						href: `/${orgSlug}/projects/${projectId}/activity`,
						current: path.endsWith(`/projects/${projectId}/activity`),
					},
				]
			: [
					{
						name: "Today",
						href: "./today",
						current: path.endsWith("/today"),
					},
					{
						name: "Projects",
						href: "./projects",
						current: path.endsWith("/projects"),
					},
					{
						name: "Settings",
						href: "./settings",
						current: path.endsWith("/settings"),
					},
				];
	}, [path, projectId]);

	return (
		<>
			{createToastWrapper(theme)}
			<div
				className={cn(
					"sticky -top-[1px] z-10 -mb-px flex w-screen self-start border-b border-gray-200 bg-background px-4 dark:border-gray-800 dark:bg-gray-950 lg:px-8",
					isSticky ? "pt-[1px] shadow-md" : "",
				)}
				ref={ref}
				aria-label="Tabs"
			>
				<Transition show={isSticky}>
					<Link
						className={cn(
							"absolute hidden self-center md:block",
							"data-[enter]:data-[leave]:transition-all ease-in-out duration-300",
							"data-[enterFrom]:data-[leaveTo]:transform translate-y-[-100%] opacity-0",
							"data-[enterTo]:data-[leaveFrom]:transform translate-y-0 opacity-100",
						)}
						href="/"
						prefetch={false}
					>
						<Image
							className="rounded-md"
							src={logo}
							alt="Manage"
							width={24}
							height={24}
						/>
					</Link>
				</Transition>

				<div
					className={cn(
						"hidden-scrollbar flex space-x-1 overflow-y-scroll transition duration-300 ease-in-out",
						isSticky ? "md:translate-x-[40px]" : "md:translate-x-0",
					)}
				>
					{tabs.map((tab) => (
						<Link
							key={tab.name}
							href={tab.href}
							className={cn(
								tab.current
									? "border-primary text-primary"
									: "border-transparent text-gray-500 dark:text-gray-400",
								"whitespace-nowrap border-b-2 py-3 text-sm font-medium",
							)}
							aria-current={tab.current ? "page" : undefined}
							prefetch={false}
						>
							<span className="rounded-md px-4 py-2 transition duration-300 ease-in-out hover:bg-gray-100 hover:text-black dark:hover:bg-gray-800 dark:hover:text-white">
								{tab.name}
							</span>
						</Link>
					))}
				</div>
			</div>
		</>
	);
}

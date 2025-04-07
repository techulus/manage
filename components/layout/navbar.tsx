"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import logo from "@/public/images/logo.png";
import { useTRPC } from "@/trpc/client";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { Notifications } from "../core/notifications";

interface NavLink {
	href: string;
	label: string;
	active?: boolean;
}

export function Navbar({ notificationsWire }: { notificationsWire: string }) {
	const isMobile = useIsMobile();
	const { systemTheme } = useTheme();
	const appearance = systemTheme === "dark" ? { baseTheme: dark } : undefined;
	const router = useRouter();
	const { tenant, projectId } = useParams();
	const pathname = usePathname();

	const trpc = useTRPC();
	const { data: projects = [] } = useQuery(
		trpc.user.getProjects.queryOptions(),
	);

	const activeProject = useMemo(() => {
		if (!projectId) {
			return null;
		}

		return projects.find((p) => p.id === +projectId);
	}, [projects, projectId]);

	const navLinks: NavLink[] = useMemo(() => {
		if (projectId) {
			return [
				{
					href: `/${tenant}/projects/${projectId}`,
					label: "Overview",
					active: pathname === `/${tenant}/projects/${projectId}`,
				},
				{
					href: `/${tenant}/projects/${projectId}/tasklists`,
					label: "Tasks",
					active: pathname.startsWith(
						`/${tenant}/projects/${projectId}/tasklists`,
					),
				},
				{
					href: `/${tenant}/projects/${projectId}/documents`,
					label: "Documents",
					active: pathname.startsWith(
						`/${tenant}/projects/${projectId}/documents`,
					),
				},
				{
					href: `/${tenant}/projects/${projectId}/events`,
					label: "Events",
					active: pathname.startsWith(
						`/${tenant}/projects/${projectId}/events`,
					),
				},
				{
					href: `/${tenant}/projects/${projectId}/activity`,
					label: "Activity",
					active: pathname === `/${tenant}/projects/${projectId}/activity`,
				},
			];
		}

		return [
			{
				href: `/${tenant}/today`,
				label: "Today",
				active: pathname === `/${tenant}/today`,
			},
			{
				href: `/${tenant}/projects`,
				label: "Projects",
				active: pathname === `/${tenant}/projects`,
			},
			{
				href: `/${tenant}/notifications`,
				label: "Notifications",
				active: pathname === `/${tenant}/notifications`,
			},
			{
				href: `/${tenant}/settings`,
				label: "Settings",
				active: pathname === `/${tenant}/settings`,
			},
		];
	}, [tenant, projectId, pathname]);

	return (
		<>
			<div className="fixed top-0 left-0 right-0 h-14 bg-gradient-to-b from-primary/10 to-transparent" />
			<div className="relative">
				<div className="flex h-14 items-center px-4">
					<div className="flex items-center">
						<Link href={`/${tenant}/today`} className="flex items-center mr-2">
							<Image src={logo} alt="Manage" width={24} height={24} />
							<span className="sr-only">Manage</span>
						</Link>

						<svg
							height="16"
							strokeLinejoin="round"
							viewBox="0 0 16 16"
							width="16"
							className="text-neutral-300 dark:text-neutral-600 w-5 h-5 mr-1"
						>
							<path
								fillRule="evenodd"
								clipRule="evenodd"
								d="M4.01526 15.3939L4.3107 14.7046L10.3107 0.704556L10.6061 0.0151978L11.9849 0.606077L11.6894 1.29544L5.68942 15.2954L5.39398 15.9848L4.01526 15.3939Z"
								fill="currentColor"
							/>
						</svg>

						<OrganizationSwitcher
							appearance={appearance}
							afterSelectOrganizationUrl="/start"
							afterLeaveOrganizationUrl="/start"
							afterSelectPersonalUrl="/start"
						/>

						{projectId ? (
							<>
								<svg
									height="16"
									strokeLinejoin="round"
									viewBox="0 0 16 16"
									width="16"
									className="text-neutral-300 dark:text-neutral-600 w-5 h-5 mr-1"
								>
									<path
										fillRule="evenodd"
										clipRule="evenodd"
										d="M4.01526 15.3939L4.3107 14.7046L10.3107 0.704556L10.6061 0.0151978L11.9849 0.606077L11.6894 1.29544L5.68942 15.2954L5.39398 15.9848L4.01526 15.3939Z"
										fill="currentColor"
									/>
								</svg>

								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											className="flex items-center p-1.5"
											size="sm"
										>
											<span className="text-sm text-neutral-500 dark:text-neutral-400">
												{activeProject?.name}
											</span>
											<ChevronDown className="h-4 w-4 text-muted-foreground" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="start" className="w-56">
										<DropdownMenuLabel>Projects</DropdownMenuLabel>
										<DropdownMenuSeparator />
										{projects.map((project) => (
											<DropdownMenuItem
												key={project.id}
												onClick={() =>
													router.push(`/${tenant}/projects/${project.id}`)
												}
												className="cursor-pointer"
											>
												<span>{project.name}</span>
											</DropdownMenuItem>
										))}
										<DropdownMenuSeparator />
										<DropdownMenuItem
											className="cursor-pointer"
											onClick={() => router.push(`/${tenant}/projects/new`)}
										>
											Create Project
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</>
						) : null}
					</div>

					<div className="ml-auto flex items-center space-x-1">
						<Button
							variant="ghost"
							size="icon"
							className={cn({
								hidden: isMobile,
							})}
							asChild
						>
							<Link href="/help">
								<HelpCircle className="h-5 w-5" />
								<span className="sr-only">Help</span>
							</Link>
						</Button>

						<Notifications notificationsWire={notificationsWire} />

						<div className="pl-2 flex items-center">
							<UserButton appearance={appearance} />
						</div>
					</div>
				</div>
			</div>

			<div className="sticky top-0 z-10 border-b backdrop-blur-lg transition-all duration-200 bg-transparent">
				<nav className="flex px-4 overflow-x-auto backdrop-blur-sm">
					{navLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className={cn(
								"flex h-10 items-center px-4 text-sm font-medium border-b-2 transition-colors hover:text-primary",
								link.active
									? "border-primary text-primary"
									: "border-transparent text-muted-foreground hover:border-muted",
							)}
						>
							{link.label}
						</Link>
					))}
				</nav>
			</div>
		</>
	);
}

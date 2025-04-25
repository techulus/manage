"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { toMachineDateString } from "@/lib/utils/date";
import logo from "@/public/images/logo.png";
import { useTRPC } from "@/trpc/client";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { CommandMenu } from "../core/cmd-menu";
import { Notifications } from "../core/notifications";

interface NavLink {
	href: string;
	label: string;
	active?: boolean;
	subItems?: {
		href: string;
		label: string;
	}[];
}

export function Navbar({ notificationsWire }: { notificationsWire: string }) {
	const isMobile = useIsMobile();
	const { systemTheme } = useTheme();
	const appearance = systemTheme === "dark" ? { baseTheme: dark } : undefined;
	const router = useRouter();
	const { tenant, projectId } = useParams();
	const pathname = usePathname();

	const trpc = useTRPC();
	const queryClient = useQueryClient();

	useEffect(() => {
		if (!tenant) {
			return;
		}

		console.log(">>>>> Invalidating all queries for tenant", tenant);
		queryClient.invalidateQueries().then(() => {
			console.log(">>>>> Invalidated all queries for tenant", tenant);
			Promise.all([
				queryClient.prefetchQuery(trpc.settings.getTimezone.queryOptions()),
				queryClient.prefetchQuery(trpc.user.getTodayData.queryOptions()),
				queryClient.prefetchQuery(
					trpc.user.getNotificationsWire.queryOptions(),
				),
				queryClient.prefetchQuery(
					trpc.user.getProjects.queryOptions({
						statuses: ["active"],
					}),
				),
			])
				.then(() => {
					console.log(">>>>> Prefetched queries for tenant", tenant);
				})
				.catch((err) => {
					console.error(">>>>> Error prefetching queries", err);
				});
		});
	}, [queryClient, trpc, tenant]);

	const [
		{ data: projects = [] },
		{ data: tasklists = [] },
		{ data: timezone },
	] = useQueries({
		queries: [
			trpc.user.getProjects.queryOptions({
				statuses: ["active"],
			}),
			{
				...trpc.tasks.getTaskLists.queryOptions({
					projectId: +projectId!,
				}),
				enabled: !!projectId,
			},
			trpc.settings.getTimezone.queryOptions(),
		],
	});

	const activeProject = useMemo(() => {
		if (!projectId) {
			return null;
		}

		return projects.find((p) => p.id === +projectId);
	}, [projects, projectId]);

	useEffect(() => {
		if (projects.length) {
			for (const project of projects) {
				console.log(">>>>> Prefetching queries for project", project.id);
				Promise.all([
					queryClient.prefetchQuery(
						trpc.projects.getProjectById.queryOptions({
							id: project.id,
						}),
					),
					queryClient.prefetchQuery(
						trpc.tasks.getTaskLists.queryOptions({
							projectId: project.id,
							statuses: ["active"],
						}),
					),
					queryClient.prefetchQuery(
						trpc.events.getByDate.queryOptions({
							projectId: project.id,
							date: new Date(),
						}),
					),
					queryClient.prefetchQuery(
						trpc.events.getByWeek.queryOptions({
							projectId: project.id,
						}),
					),
				])
					.then(() => {
						console.log(">>>>> Prefetched queries for project", project.id);
					})
					.catch((err) => {
						console.error(">>>>> Error prefetching queries", err);
					});
			}
		}
	}, [queryClient, trpc, projects]);

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
					subItems: tasklists.map((tasklist) => ({
						href: `/${tenant}/projects/${projectId}/tasklists/${tasklist.id}`,
						label: tasklist.name,
					})),
				},
				{
					href: `/${tenant}/projects/${projectId}/events?on=${toMachineDateString(new Date(), timezone!)}`,
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
	}, [tenant, projectId, pathname, timezone, tasklists]);

	return (
		<>
			<CommandMenu tenant={tenant as string} projectId={+projectId!} />
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
									{activeProject?.name || "Projects"}
								</span>
								<ChevronDown className="h-4 w-4 text-muted-foreground" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start" className="w-56">
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
						</DropdownMenuContent>
					</DropdownMenu>
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
						<Link href="https://github.com/techulus/manage/issues">
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

			<nav
				className="flex px-4 overflow-x-auto text-sm border-b"
				suppressHydrationWarning
			>
				{navLinks.map((link) =>
					link.subItems?.length ? (
						<DropdownMenu key={link.href}>
							<DropdownMenuTrigger asChild>
								<div
									className={cn(
										"flex h-8 items-center px-4 text-sm font-medium border-b-2 transition-colors hover:text-primary space-x-1 cursor-pointer",
										link.active
											? "border-primary text-primary"
											: "border-transparent text-muted-foreground hover:border-muted",
									)}
								>
									<span>{link.label}</span>
									<ChevronDown className="h-4 w-4" />
								</div>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="w-56">
								<DropdownMenuItem asChild>
									<Link className="cursor-pointer" href={link.href}>
										Overview
									</Link>
								</DropdownMenuItem>
								{link.subItems.map((subItem) => (
									<DropdownMenuItem key={subItem.href} asChild>
										<Link className="cursor-pointer" href={subItem.href}>
											{subItem.label}
										</Link>
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<Link
							key={link.href}
							href={link.href}
							className={cn(
								"flex h-8 items-center px-4 text-sm font-medium border-b-2 transition-colors hover:text-primary",
								link.active
									? "border-primary text-primary"
									: "border-transparent text-muted-foreground hover:border-muted",
							)}
						>
							{link.label}
						</Link>
					),
				)}
			</nav>
		</>
	);
}

"use client";

import {
	CalendarCheck,
	ChevronRight,
	File,
	GaugeIcon,
	ListChecksIcon,
	type LucideIcon,
	SettingsIcon,
} from "lucide-react";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	useSidebar,
} from "@/components/ui/sidebar";
import type { ProjectWithData } from "@/drizzle/types";
import { cn } from "@/lib/utils";
import { getProjectById } from "@/lib/utils/useProjects";
import { CalendarHeartIcon } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type MainNavItem = {
	title: string;
	url: string;
	icon?: LucideIcon;
	isActive?: boolean;
	items?: {
		title: string;
		url: string;
		isActive?: boolean;
	}[];
};

export function NavMain() {
	const { setOpenMobile } = useSidebar();
	const { tenant, projectId } = useParams();
	const pathname = usePathname();

	const [projectData, setProjectData] = useState<ProjectWithData | null>(null);

	useEffect(() => {
		if (projectId) {
			getProjectById(String(projectId), true)
				.then((data) => {
					setProjectData(data);
				})
				.catch((error) => {
					setProjectData(null);
					console.error(error);
				});
		}
	}, [projectId]);

	const navItems: MainNavItem[] = useMemo(() => {
		const items: MainNavItem[] = [
			{
				title: "Today",
				url: `/${tenant}/today`,
				icon: CalendarHeartIcon,
				isActive: pathname === `/${tenant}/today`,
			},
		];

		if (projectId && projectData) {
			const taskListItems = [];
			if (projectData.taskLists?.length) {
				taskListItems.push({
					title: "Overview",
					url: `/${tenant}/projects/${projectId}/tasklists`,
					isActive: pathname === `/${tenant}/projects/${projectId}/tasklists`,
				});

				for (const taskList of projectData.taskLists) {
					if (taskList.status !== "active") continue;
					taskListItems.push({
						title: taskList.name,
						url: `/${tenant}/projects/${projectId}/tasklists/${taskList.id}`,
						isActive:
							pathname ===
							`/${tenant}/projects/${projectId}/tasklists/${taskList.id}`,
					});
				}
			}

			const folderItems = [];
			if (projectData.documentFolders?.length) {
				folderItems.push({
					title: "Overview",
					url: `/${tenant}/projects/${projectId}/documents`,
					isActive: pathname === `/${tenant}/projects/${projectId}/documents`,
				});
				for (const folder of projectData.documentFolders) {
					folderItems.push({
						title: folder.name,
						url: `/${tenant}/projects/${projectId}/documents/folders/${folder.id}`,
						isActive: pathname.startsWith(
							`/${tenant}/projects/${projectId}/documents/folders/${folder.id}`,
						),
					});
				}
			}

			items.push(
				...[
					{
						title: "Overview",
						url: `/${tenant}/projects/${projectId}`,
						icon: GaugeIcon,
						isActive: pathname === `/${tenant}/projects/${projectId}`,
					},
					{
						title: "Task Lists",
						url: `/${tenant}/projects/${projectId}/tasklists`,
						icon: ListChecksIcon,
						items: taskListItems,
						isActive: pathname.startsWith(
							`/${tenant}/projects/${projectId}/tasklists`,
						),
					},
					{
						title: "Docs & Files",
						url: `/${tenant}/projects/${projectId}/documents`,
						icon: File,
						items: folderItems,
						isActive: pathname.startsWith(
							`/${tenant}/projects/${projectId}/documents`,
						),
					},
					{
						title: "Events",
						url: `/${tenant}/projects/${projectId}/events`,
						icon: CalendarCheck,
						isActive: pathname.startsWith(
							`/${tenant}/projects/${projectId}/events`,
						),
					},
					{
						title: "Settings",
						url: `/${tenant}/projects/${projectId}/edit`,
						icon: SettingsIcon,
						isActive: pathname === `/${tenant}/projects/${projectId}/edit`,
					},
				],
			);
		}

		return items;
	}, [tenant, projectId, projectData, pathname]);

	return (
		<SidebarGroup>
			<SidebarGroupLabel className="font-bold">Tools</SidebarGroupLabel>
			<SidebarMenu>
				{navItems.map((navItem) =>
					navItem.items?.length ? (
						<Collapsible
							key={navItem.title}
							asChild
							defaultOpen={navItem.isActive}
							className="group/collapsible"
						>
							<SidebarMenuItem>
								<CollapsibleTrigger asChild>
									<SidebarMenuButton tooltip={navItem.title}>
										{navItem.icon && (
											<navItem.icon
												className={navItem.isActive ? "text-primary" : ""}
											/>
										)}
										<span
											className={cn(navItem.isActive ? "font-semibold" : null)}
										>
											{navItem.title}
										</span>
										<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
									</SidebarMenuButton>
								</CollapsibleTrigger>
								<CollapsibleContent>
									<SidebarMenuSub>
										{navItem.items?.map((subItem) => (
											<SidebarMenuSubItem key={subItem.title}>
												<SidebarMenuSubButton
													asChild
													onClick={() => setOpenMobile(false)}
												>
													<Link href={subItem.url}>
														<span
															className={cn(
																subItem.isActive ? "font-semibold" : null,
															)}
														>
															{subItem.title}
														</span>
													</Link>
												</SidebarMenuSubButton>
											</SidebarMenuSubItem>
										))}
									</SidebarMenuSub>
								</CollapsibleContent>
							</SidebarMenuItem>
						</Collapsible>
					) : (
						<SidebarMenuItem key={navItem.title}>
							<SidebarMenuButton
								tooltip={navItem.title}
								asChild
								onClick={() => setOpenMobile(false)}
							>
								<Link href={navItem.url}>
									{navItem.icon && (
										<navItem.icon
											className={navItem.isActive ? "text-primary" : ""}
										/>
									)}
									<span
										className={cn(navItem.isActive ? "font-semibold" : null)}
									>
										{navItem.title}
									</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					),
				)}
			</SidebarMenu>
		</SidebarGroup>
	);
}

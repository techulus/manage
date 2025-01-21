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
} from "@/components/ui/sidebar";
import type { ProjectWithData } from "@/drizzle/types";
import { getProjectById } from "@/lib/utils/useProjects";
import { CalendarHeartIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type MainNavItem = {
	title: string;
	url: string;
	icon?: LucideIcon;
	isActive?: boolean;
	items?: {
		title: string;
		url: string;
	}[];
};

export function NavMain() {
	const { tenant, projectId } = useParams();

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
			},
		];

		if (projectId && projectData) {
			const taskListItems = [];
			if (projectData.taskLists?.length) {
				taskListItems.push({
					title: "Overview",
					url: `/${tenant}/projects/${projectId}/tasklists`,
				});
				for (const taskList of projectData.taskLists) {
					if (taskList.status !== "active") continue;
					taskListItems.push({
						title: taskList.name,
						url: `/${tenant}/projects/${projectId}/tasklists/${taskList.id}`,
					});
				}
			}

			const folderItems = [];
			if (projectData.documentFolders?.length) {
				folderItems.push({
					title: "Overview",
					url: `/${tenant}/projects/${projectId}/documents`,
				});
				for (const folder of projectData.documentFolders) {
					folderItems.push({
						title: folder.name,
						url: `/${tenant}/projects/${projectId}/documents/folders/${folder.id}`,
					});
				}
			}

			items.push(
				...[
					{
						title: "Overview",
						url: `/${tenant}/projects/${projectId}`,
						icon: GaugeIcon,
					},
					{
						title: "Task Lists",
						url: `/${tenant}/projects/${projectId}/tasklists`,
						icon: ListChecksIcon,
						items: taskListItems,
					},
					{
						title: "Docs & Files",
						url: `/${tenant}/projects/${projectId}/documents`,
						icon: File,
						items: folderItems,
					},
					{
						title: "Events",
						url: `/${tenant}/projects/${projectId}/events`,
						icon: CalendarCheck,
					},
					{
						title: "Settings",
						url: `/${tenant}/projects/${projectId}/edit`,
						icon: SettingsIcon,
					},
				],
			);
		}

		return items;
	}, [tenant, projectId, projectData]);

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
										{navItem.icon && <navItem.icon />}
										<span>{navItem.title}</span>
										<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
									</SidebarMenuButton>
								</CollapsibleTrigger>
								<CollapsibleContent>
									<SidebarMenuSub>
										{navItem.items?.map((subItem) => (
											<SidebarMenuSubItem key={subItem.title}>
												<SidebarMenuSubButton asChild>
													<Link href={subItem.url}>
														<span>{subItem.title}</span>
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
							<SidebarMenuButton tooltip={navItem.title} asChild>
								<Link href={navItem.url}>
									{navItem.icon && <navItem.icon />}
									<span>{navItem.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					),
				)}
			</SidebarMenu>
		</SidebarGroup>
	);
}

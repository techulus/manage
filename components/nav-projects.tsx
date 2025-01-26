"use client";

import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import type { ProjectWithCreator } from "@/drizzle/types";
import { cn } from "@/lib/utils";
import { getProjectsForOwner } from "@/lib/utils/useProjects";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export function NavProjects() {
	const { setOpenMobile } = useSidebar();
	const { tenant, projectId } = useParams();
	const [projects, setProjects] = useState<ProjectWithCreator[]>([]);

	useEffect(() => {
		getProjectsForOwner({
			statuses: ["active"],
		})
			.then((data) => {
				setProjects(data.projects);
			})
			.catch((error) => {
				console.error(error);
			});
	}, []);

	return (
		<SidebarGroup className="group-data-[collapsible=icon]:hidden">
			<SidebarGroupLabel className="font-bold">Projects</SidebarGroupLabel>
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton asChild onClick={() => setOpenMobile(false)}>
						<Link href={`/${tenant}/projects`}>
							<span className={cn(!projectId ? "font-semibold" : null)}>
								Overview
							</span>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>
				{projects.map((item) => (
					<SidebarMenuItem key={item.name}>
						<SidebarMenuButton asChild onClick={() => setOpenMobile(false)}>
							<Link href={`/${tenant}/projects/${item.id}`}>
								<span
									className={cn(
										+(projectId ?? 0) === item.id ? "font-semibold" : null,
									)}
								>
									{item.name}
								</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}

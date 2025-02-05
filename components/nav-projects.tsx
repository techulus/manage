"use client";

import { getSidebarStream } from "@/app/(dashboard)/[tenant]/settings/actions";
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
import { useCable } from "@/lib/utils/cable-client";
import { getProjectsForOwner } from "@/lib/utils/useProjects";
import type { Channel } from "@anycable/web";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function NavProjects() {
	const { setOpenMobile } = useSidebar();
	const { tenant, projectId } = useParams();
	const [projects, setProjects] = useState<ProjectWithCreator[]>([]);
	const cable = useCable();
	const pathname = usePathname();

	const getProjects = useCallback(() => {
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

	useEffect(() => {
		getProjects();
	}, [getProjects]);

	useEffect(() => {
		if (!cable) return;

		let channel: Channel | undefined;

		getSidebarStream().then((stream) => {
			channel = cable.streamFromSigned(stream);
			channel.on("message", (_) => {
				getProjects();
			});
		});

		return () => {
			channel?.disconnect();
		};
	}, [cable, getProjects]);

	return (
		<SidebarGroup className="group-data-[collapsible=icon]:hidden">
			<SidebarGroupLabel className="font-bold uppercase">
				Projects
			</SidebarGroupLabel>
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton asChild onClick={() => setOpenMobile(false)}>
						<Link href={`/${tenant}/projects`}>
							<span
								className={cn(
									pathname === `/${tenant}/projects` ? "font-semibold" : null,
								)}
							>
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

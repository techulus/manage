"use client";

import { getSidebarWire } from "@/app/(dashboard)/[tenant]/settings/actions";
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
import { TurboWire } from "@turbowire/web";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function NavProjects() {
	const { setOpenMobile } = useSidebar();
	const { tenant, projectId } = useParams();
	const [projects, setProjects] = useState<ProjectWithCreator[]>([]);
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
		let disconnectWire: (() => void) | undefined;

		getSidebarWire().then((signedWire) => {
			const { disconnect } = new TurboWire(signedWire).connect(() => {
				getProjects();
			});

			disconnectWire = disconnect;
		});

		return () => {
			disconnectWire?.();
		};
	}, [getProjects]);

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
										+(projectId ?? 0) === item.id
											? "font-semibold text-primary"
											: null,
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

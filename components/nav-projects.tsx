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
import { useCallback, useEffect, useMemo, useState } from "react";

export function NavProjects() {
	const { setOpenMobile } = useSidebar();
	const { tenant, projectId } = useParams();
	const pathname = usePathname();

	const localStorageKey = useMemo(
		() => `tenant-${tenant}-projects-nav`,
		[tenant],
	);

	const [projects, setProjects] = useState<ProjectWithCreator[]>(() => {
		try {
			const cached = localStorage.getItem(localStorageKey);
			if (cached) {
				const { data, ts } = JSON.parse(cached);
				if (ts > Date.now() - 1000 * 60 * 60 * 24) {
					return data;
				}
				localStorage.removeItem(localStorageKey);
			}
			return [];
		} catch (error) {
			console.error(error);
			return [];
		}
	});

	const getProjects = useCallback(() => {
		getProjectsForOwner({
			statuses: ["active"],
		})
			.then((data) => {
				setProjects(data.projects);
				localStorage.setItem(
					localStorageKey,
					JSON.stringify({
						ts: Date.now(),
						data: data.projects,
					}),
				);
			})
			.catch((error) => {
				setProjects([]);
				console.error(error);
				localStorage.removeItem(localStorageKey);
			});
	}, [localStorageKey]);

	useEffect(() => {
		getProjects();
	}, [getProjects]);

	useEffect(() => {
		let wire: TurboWire | undefined;

		getSidebarWire().then((signedWire) => {
			wire = new TurboWire(signedWire);
			wire.connect(() => {
				getProjects();
			});
		});

		return () => {
			wire?.disconnect();
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

"use client";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import type * as React from "react";

export function AppSidebar({
	notificationsWire,
	sidebarWire,
	...props
}: React.ComponentProps<typeof Sidebar> & {
	notificationsWire: string;
	sidebarWire: string;
}) {
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<WorkspaceSwitcher />
			</SidebarHeader>
			<SidebarContent>
				<NavMain
					notificationsWire={notificationsWire}
					sidebarWire={sidebarWire}
				/>
				<NavProjects sidebarWire={sidebarWire} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}

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
	user,
	notificationsWire,
	sidebarWire,
	...props
}: React.ComponentProps<typeof Sidebar> & {
	user: {
		firstName: string;
		imageUrl: string | null;
		email: string;
	};
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
				<NavUser user={user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}

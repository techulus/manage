"use client";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import type * as React from "react";

export function AppSidebar({
	user,
	...props
}: React.ComponentProps<typeof Sidebar> & {
	user: {
		firstName: string;
		imageUrl: string | null;
		email: string;
	};
}) {
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<WorkspaceSwitcher />
			</SidebarHeader>
			<SidebarContent>
				<NavMain />
				<NavProjects />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}

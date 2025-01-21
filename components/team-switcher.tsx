"use client";

import { ChevronsUpDown, Plus } from "lucide-react";
import * as React from "react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import type { Organization } from "@/lib/ops/auth";
import { getUserOrganizations } from "@/lib/utils/useUser";
import { useParams } from "next/navigation";
import { Skeleton } from "./ui/skeleton";

export function TeamSwitcher() {
	const { isMobile } = useSidebar();
	const { tenant: activeOrgId } = useParams();
	const [orgs, setOrgs] = React.useState<Organization[]>([]);
	const [loading, setLoading] = React.useState(false);

	const activeOrg = React.useMemo(
		() => orgs.find((org) => org.id === activeOrgId),
		[orgs, activeOrgId],
	);

	const fetchOrgs = React.useCallback(async () => {
		setLoading(true);
		await getUserOrganizations()
			.then((data) => {
				setOrgs(data);
			})
			.finally(() => {
				setLoading(false);
			});
	}, []);

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu
					onOpenChange={(open) => {
						if (open) {
							fetchOrgs();
						}
					}}
				>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">
									{activeOrg?.name ?? "Personal"}
								</span>
								<span className="truncate text-xs">Hobby</span>
							</div>
							<ChevronsUpDown className="ml-auto" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						align="start"
						side={isMobile ? "bottom" : "right"}
						sideOffset={4}
					>
						<DropdownMenuLabel className="text-xs text-muted-foreground">
							Workspaces
						</DropdownMenuLabel>
						<DropdownMenuItem
							// onClick={() => setActiveTeam(team)}
							className="gap-2 p-2"
						>
							Personal
							<DropdownMenuShortcut>⌘1</DropdownMenuShortcut>
						</DropdownMenuItem>
						{loading ? (
							<div className="space-y-2 pl-1.5">
								<Skeleton className="h-5 w-[160px]" />
								<Skeleton className="h-5 w-[160px]" />
							</div>
						) : (
							orgs.map((org, index) => (
								<DropdownMenuItem
									key={org.id}
									// onClick={() => setActiveTeam(team)}
									className="gap-2 p-2"
								>
									{org.name}
									<DropdownMenuShortcut>⌘{index + 2}</DropdownMenuShortcut>
								</DropdownMenuItem>
							))
						)}
						<DropdownMenuSeparator />
						<DropdownMenuItem className="gap-2 p-2">
							<div className="flex size-6 items-center justify-center rounded-md border bg-background">
								<Plus className="size-4" />
							</div>
							<div className="font-medium text-muted-foreground">
								Add workspace
							</div>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}

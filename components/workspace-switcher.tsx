"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/betterauth/auth-client";
import { ChevronsUpDown, CogIcon, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function WorkspaceSwitcher() {
	const { isMobile } = useSidebar();
	const { data: organizations } = authClient.useListOrganizations();
	const { data: activeOrganization } = authClient.useActiveOrganization();
	const router = useRouter();

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">
									{activeOrganization?.name ?? "Personal"}
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
							onClick={async () => {
								await authClient.organization.setActive({
									organizationId: null,
								});
								router.push("/start");
							}}
							className="gap-2 p-2 cursor-pointer"
						>
							Personal
						</DropdownMenuItem>
						{(organizations ?? []).map((org) => (
							<DropdownMenuItem
								key={org.id}
								className="gap-2 p-2 cursor-pointer"
							>
								<button
									type="button"
									onClick={async () => {
										await authClient.organization.setActive({
											organizationId: org.id,
										});
										router.push("/start");
									}}
								>
									{org.name}
								</button>
								<Link
									href={`/workspace/${org.slug}/manage`}
									className="font-medium text-muted-foreground ml-auto"
								>
									<CogIcon className="w-5 h-5" />
								</Link>
							</DropdownMenuItem>
						))}
						<DropdownMenuSeparator />
						<DropdownMenuItem>
							<div className="flex size-6 items-center justify-center rounded-md border bg-background">
								<Plus className="size-4" />
							</div>
							<Link
								href="/workspace/create"
								className="font-medium text-muted-foreground"
							>
								Add workspace
							</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}

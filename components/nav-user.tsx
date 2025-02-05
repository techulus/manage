"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
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
import { signOut } from "@/lib/betterauth/auth-client";
import { ChevronsUpDown, HelpCircle, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { UserAvatar } from "./core/user-avatar";

export function NavUser({
	user,
}: {
	user: {
		firstName: string;
		imageUrl: string | null;
		email: string;
	};
}) {
	const { isMobile, setOpenMobile } = useSidebar();
	const { tenant: orgSlug } = useParams();
	const router = useRouter();

	return (
		<SidebarMenu className="pb-8 md:pb-0">
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<UserAvatar user={user} />
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">{user.firstName}</span>
								<span className="truncate text-xs">{user.email}</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<UserAvatar user={user} />
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">
										{user.firstName}
									</span>
									<span className="truncate text-xs">{user.email}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem onClick={() => setOpenMobile(false)}>
								<Link
									href={`/${orgSlug}/settings`}
									prefetch={false}
									className="w-full flex items-center gap-2"
								>
									<Settings />
									Settings
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Link
									href="mailto:support@managee.xyz"
									prefetch={false}
									className="w-full flex items-center gap-2"
								>
									<HelpCircle />
									Support
								</Link>
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() => setOpenMobile(false)}
							className="w-full"
						>
							<LogOut />
							<button
								type="button"
								onClick={() => {
									signOut();
									router.replace("/sign-in");
								}}
							>
								Sign Out
							</button>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}

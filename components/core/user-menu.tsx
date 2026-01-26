"use client";

import { LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/core/user-avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	authClient,
	useActiveOrganization,
	useSession,
} from "@/lib/auth/client";

export function UserMenu() {
	const router = useRouter();
	const { data: session } = useSession();
	const { data: activeOrg } = useActiveOrganization();

	if (!session?.user) {
		return null;
	}

	const { user } = session;
	const tenant = activeOrg?.slug ?? "me";

	async function handleSignOut() {
		await authClient.signOut();
		router.push("/sign-in");
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button type="button" className="cursor-pointer">
					<UserAvatar
						user={{ id: user.id, name: user.name }}
						className="h-8 w-8"
					/>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel>
					<div className="flex flex-col space-y-1">
						<p className="text-sm font-medium leading-none">{user.name}</p>
						<p className="text-xs leading-none text-muted-foreground">
							{user.email}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild className="cursor-pointer">
					<Link href={`/${tenant}/settings`}>
						<Settings className="mr-2 h-4 w-4" />
						<span>Settings</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
					<LogOut className="mr-2 h-4 w-4" />
					<span>Sign out</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

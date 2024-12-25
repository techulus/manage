import { logtoConfig } from "@/app/logto";
import { signOut } from "@logto/next/server-actions";
import { ChevronsUpDown, Plus, User } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

// WIP, this should be changed
export type Organization = {
	id: string;
	name: string;
	slug: string;
};

export const OrgSwitcher = ({
	orgs,
	activeOrg,
}: {
	orgs: Organization[];
	activeOrg: Organization | null;
}) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="flex w-full items-center justify-between px-2 py-1 focus:outline-none"
				>
					<span className="truncate">{activeOrg?.name ?? "Personal"}</span>
					<ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem asChild>
					<form
					// action={(formData) =>
					// 	toast.promise(switchOrganization(formData), {
					// 		loading: "Switching to Personal...",
					// 		success: "Switched to Personal!",
					// 		error: "Failed to switch organization.",
					// 	})
					// }
					>
						<button type="submit" className="flex w-full">
							Personal
						</button>
					</form>
				</DropdownMenuItem>
				{orgs.map((org) => (
					<DropdownMenuItem key={org.id} asChild>
						<form
							key={org.id}
							// action={(formData) =>
							// 	toast.promise(switchOrganization(formData), {
							// 		loading: `Switching to ${org.name}...`,
							// 		success: `Switched to ${org.name}!`,
							// 		error: "Failed to switch organization.",
							// 	})
							// }
						>
							<input type="hidden" name="id" value={org.id} />
							<input type="hidden" name="slug" value={org.slug} />
							<button
								type="submit"
								className="flex w-full"
								disabled={activeOrg?.id === org.id}
							>
								{org.name}
							</button>
						</form>
					</DropdownMenuItem>
				))}
				<DropdownMenuSeparator />
				{activeOrg ? (
					<DropdownMenuItem asChild>
						<Link href="#" className="flex items-center justify-between">
							Invite Members
							<Plus className="ml-2 h-4 w-4" />
						</Link>
					</DropdownMenuItem>
				) : (
					<DropdownMenuItem asChild>
						<Link href="#" className="flex items-center justify-between">
							Create Organization
							<Plus className="ml-2 h-4 w-4" />
						</Link>
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export const UserButton = ({ orgSlug }: { orgSlug: string }) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="icon"
					className="overflow-hidden rounded-full"
				>
					<User className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>My Account</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem>
					<Link
						href={`/${orgSlug}/settings`}
						prefetch={false}
						className="w-full"
					>
						Settings
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem>
					<Link
						href="mailto:support@managee.xyz"
						prefetch={false}
						className="w-full"
					>
						Support
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem>
					<form
						action={async () => {
							await signOut(logtoConfig, "/");
						}}
					>
						<button type="submit">Sign Out</button>
					</form>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

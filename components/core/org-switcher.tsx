"use client";

import { useState, useEffect, useCallback } from "react";
import { Building2, ChevronDown, Plus, User, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { authClient, useActiveOrganization, useSession } from "@/lib/auth/client";
import { toast } from "sonner";

type Organization = {
	id: string;
	name: string;
	slug: string | null;
};

export function OrgSwitcher() {
	const { data: session } = useSession();
	const { data: activeOrg } = useActiveOrganization();
	const [orgs, setOrgs] = useState<Organization[]>([]);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [newOrgName, setNewOrgName] = useState("");
	const [creating, setCreating] = useState(false);

	const fetchOrgs = useCallback(async () => {
		try {
			const result = await authClient.organization.list();
			if (result.data) {
				setOrgs(result.data);
			}
		} catch (error) {
			console.error("Failed to fetch organizations:", error);
		}
	}, []);

	useEffect(() => {
		if (session?.user) {
			fetchOrgs();
		}
	}, [session?.user, fetchOrgs]);

	if (!session?.user) {
		return null;
	}

	const displayName = activeOrg?.name ?? "Personal";

	async function switchToPersonal() {
		await authClient.organization.setActive({ organizationId: null });
		window.location.href = "/start";
	}

	async function switchToOrg(orgId: string) {
		await authClient.organization.setActive({ organizationId: orgId });
		window.location.href = "/start";
	}

	async function createOrganization() {
		if (!newOrgName.trim()) return;
		setCreating(true);
		try {
			const result = await authClient.organization.create({
				name: newOrgName.trim(),
				slug: newOrgName.trim().toLowerCase().replace(/\s+/g, "-"),
			});
			if (result.data) {
				await authClient.organization.setActive({ organizationId: result.data.id });
				setCreateDialogOpen(false);
				setNewOrgName("");
				toast.success("Workspace created");
				window.location.href = "/start";
			} else if (result.error) {
				toast.error(result.error.message || "Failed to create workspace");
			}
		} catch (error) {
			console.error("Failed to create workspace:", error);
			toast.error("Failed to create workspace");
		} finally {
			setCreating(false);
		}
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="flex items-center p-1.5" size="sm">
						{activeOrg ? (
							<Building2 className="h-4 w-4 mr-1" />
						) : (
							<User className="h-4 w-4 mr-1" />
						)}
						<span className="text-sm text-neutral-500 dark:text-neutral-400 max-w-24 truncate">
							{displayName}
						</span>
						<ChevronDown className="h-4 w-4 text-muted-foreground" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" className="w-56">
					<DropdownMenuLabel>Switch workspace</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={switchToPersonal}
						className="cursor-pointer"
					>
						<User className="mr-2 h-4 w-4" />
						<span>Personal</span>
						{!activeOrg && <Check className="ml-auto h-4 w-4" />}
					</DropdownMenuItem>
					{orgs.map((org) => (
						<DropdownMenuItem
							key={org.id}
							onClick={() => switchToOrg(org.id)}
							className="cursor-pointer"
						>
							<Building2 className="mr-2 h-4 w-4" />
							<span className="truncate">{org.name}</span>
							{activeOrg?.id === org.id && <Check className="ml-auto h-4 w-4" />}
						</DropdownMenuItem>
					))}
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={() => setCreateDialogOpen(true)}
						className="cursor-pointer"
					>
						<Plus className="mr-2 h-4 w-4" />
						<span>Create workspace</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create workspace</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="org-name">Workspace name</Label>
							<Input
								id="org-name"
								value={newOrgName}
								onChange={(e) => setNewOrgName(e.target.value)}
								placeholder="My Team"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={createOrganization} disabled={creating || !newOrgName.trim()}>
							{creating ? "Creating..." : "Create"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

"use client";

import { Building2, Check, ChevronDown, Plus, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	authClient,
	useActiveOrganization,
	useSession,
} from "@/lib/auth/client";

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
	const [newOrgSlug, setNewOrgSlug] = useState("");
	const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
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

	const generateSlug = (name: string) =>
		name
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, "")
			.replace(/\s+/g, "-");

	const handleNameChange = (name: string) => {
		setNewOrgName(name);
		if (!slugManuallyEdited) {
			setNewOrgSlug(generateSlug(name));
		}
	};

	const handleSlugChange = (slug: string) => {
		setSlugManuallyEdited(true);
		setNewOrgSlug(slug.toLowerCase().replace(/[^a-z0-9-]/g, ""));
	};

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
		if (!newOrgName.trim() || !newOrgSlug.trim()) return;
		setCreating(true);
		try {
			const result = await authClient.organization.create({
				name: newOrgName.trim(),
				slug: newOrgSlug.trim(),
			});
			if (result.data) {
				await authClient.organization.setActive({
					organizationId: result.data.id,
				});
				setCreateDialogOpen(false);
				setNewOrgName("");
				setNewOrgSlug("");
				setSlugManuallyEdited(false);
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
							{activeOrg?.id === org.id && (
								<Check className="ml-auto h-4 w-4" />
							)}
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

			<Dialog
				open={createDialogOpen}
				onOpenChange={(open) => {
					setCreateDialogOpen(open);
					if (!open) {
						setNewOrgName("");
						setNewOrgSlug("");
						setSlugManuallyEdited(false);
					}
				}}
			>
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
								onChange={(e) => handleNameChange(e.target.value)}
								placeholder="My Team"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="org-slug">Slug</Label>
							<Input
								id="org-slug"
								value={newOrgSlug}
								onChange={(e) => handleSlugChange(e.target.value)}
								placeholder="my-team"
							/>
							<p className="text-xs text-muted-foreground">
								Used in URLs. Only lowercase letters, numbers, and hyphens.
							</p>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setCreateDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							onClick={createOrganization}
							disabled={creating || !newOrgName.trim() || !newOrgSlug.trim()}
						>
							{creating ? "Creating..." : "Create"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

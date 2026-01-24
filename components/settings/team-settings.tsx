"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { UserAvatar } from "@/components/core/user-avatar";
import { authClient, useActiveOrganization } from "@/lib/auth/client";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";
import { Mail, UserPlus, X } from "lucide-react";

type Member = {
	id: string;
	userId: string;
	role: string;
	user: {
		id: string;
		name: string;
		email: string;
		image?: string | null;
		firstName?: string | null;
		lastName?: string | null;
	};
};

type Invitation = {
	id: string;
	email: string;
	role: string;
	status: string;
	expiresAt: Date;
};

export function TeamSettings() {
	const { data: activeOrg } = useActiveOrganization();
	const trpc = useTRPC();
	const [invitations, setInvitations] = useState<Invitation[]>([]);
	const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteRole, setInviteRole] = useState<"member" | "admin">("member");
	const [isInviting, setIsInviting] = useState(false);

	const {
		data: members = [],
		isLoading,
		refetch: refetchMembers,
	} = useQuery(trpc.permissions.getOrganizationMembers.queryOptions());

	const fetchInvitations = useCallback(async () => {
		if (!activeOrg?.id) return;

		try {
			const result = await authClient.organization.getFullOrganization({
				query: { organizationId: activeOrg.id },
			});

			if (result.data) {
				setInvitations(result.data.invitations || []);
			}
		} catch (error) {
			console.error("Failed to fetch invitations:", error);
		}
	}, [activeOrg?.id]);

	useEffect(() => {
		fetchInvitations();
	}, [fetchInvitations]);

	async function inviteMember() {
		if (!inviteEmail.trim() || !activeOrg?.id) return;

		setIsInviting(true);
		try {
			const result = await authClient.organization.inviteMember({
				email: inviteEmail.trim(),
				role: inviteRole,
				organizationId: activeOrg.id,
			});

			if (result.error) {
				toast.error(result.error.message || "Failed to send invitation");
			} else {
				toast.success(`Invitation sent to ${inviteEmail}`);
				setInviteDialogOpen(false);
				setInviteEmail("");
				setInviteRole("member");
				fetchInvitations();
			}
		} catch (error) {
			console.error("Invite error:", error);
			toast.error("Failed to send invitation");
		} finally {
			setIsInviting(false);
		}
	}

	async function cancelInvitation(invitationId: string) {
		if (!activeOrg?.id) return;

		try {
			await authClient.organization.cancelInvitation({
				invitationId,
			});
			toast.success("Invitation cancelled");
			fetchInvitations();
		} catch (error) {
			console.error("Cancel invitation error:", error);
			toast.error("Failed to cancel invitation");
		}
	}

	async function removeMember(memberId: string) {
		if (!activeOrg?.id) return;

		try {
			await authClient.organization.removeMember({
				memberIdOrEmail: memberId,
				organizationId: activeOrg.id,
			});
			toast.success("Member removed");
			refetchMembers();
		} catch (error) {
			console.error("Remove member error:", error);
			toast.error("Failed to remove member");
		}
	}

	async function updateMemberRole(memberId: string, role: string) {
		if (!activeOrg?.id) return;

		try {
			await authClient.organization.updateMemberRole({
				memberId,
				role: role as "member" | "admin" | "owner",
				organizationId: activeOrg.id,
			});
			toast.success("Role updated");
			refetchMembers();
		} catch (error) {
			console.error("Update role error:", error);
			toast.error("Failed to update role");
		}
	}

	if (!activeOrg) {
		return (
			<div className="p-4 text-muted-foreground">
				Team settings are only available for workspaces.
			</div>
		);
	}

	if (isLoading) {
		return <div className="p-4 text-muted-foreground">Loading...</div>;
	}

	return (
		<>
			<div className="divide-y">
				<div className="p-4 flex justify-between items-center">
					<div>
						<h3 className="font-semibold">Team Members</h3>
						<p className="text-sm text-muted-foreground">
							Manage who has access to this workspace
						</p>
					</div>
					<Button onClick={() => setInviteDialogOpen(true)} size="sm">
						<UserPlus className="h-4 w-4 mr-2" />
						Invite
					</Button>
				</div>

				{members.map((member) => (
					<div
						key={member.id}
						className="p-4 flex items-center justify-between"
					>
						<div className="flex items-center gap-3">
							<UserAvatar
								user={{
									id: member.user.id,
									firstName: member.user.firstName,
									name: member.user.name,
									email: member.user.email,
								}}
							/>
							<div>
								<p className="font-medium">
									{member.user.firstName || member.user.lastName
										? `${member.user.firstName ?? ""} ${member.user.lastName ?? ""}`.trim()
										: member.user.name || member.user.email}
								</p>
								<p className="text-sm text-muted-foreground">
									{member.user.email}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							{member.role === "owner" ? (
								<span className="text-sm text-muted-foreground capitalize">
									{member.role}
								</span>
							) : (
								<>
									<Select
										value={member.role}
										onValueChange={(value) =>
											updateMemberRole(member.id, value)
										}
									>
										<SelectTrigger className="w-24">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="member">Member</SelectItem>
											<SelectItem value="admin">Admin</SelectItem>
										</SelectContent>
									</Select>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => removeMember(member.id)}
									>
										<X className="h-4 w-4" />
									</Button>
								</>
							)}
						</div>
					</div>
				))}

				{invitations.length > 0 && (
					<>
						<div className="p-4">
							<h4 className="font-medium text-sm text-muted-foreground">
								Pending Invitations
							</h4>
						</div>
						{invitations
							.filter((inv) => inv.status === "pending")
							.map((invitation) => (
								<div
									key={invitation.id}
									className="p-4 flex items-center justify-between bg-muted/50"
								>
									<div className="flex items-center gap-3">
										<div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
											<Mail className="h-4 w-4 text-muted-foreground" />
										</div>
										<div>
											<p className="font-medium">{invitation.email}</p>
											<p className="text-sm text-muted-foreground capitalize">
												{invitation.role} · Pending
											</p>
										</div>
									</div>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => cancelInvitation(invitation.id)}
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							))}
					</>
				)}
			</div>

			<Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Invite team member</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="invite-email">Email address</Label>
							<Input
								id="invite-email"
								type="email"
								value={inviteEmail}
								onChange={(e) => setInviteEmail(e.target.value)}
								placeholder="colleague@example.com"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="invite-role">Role</Label>
							<Select
								value={inviteRole}
								onValueChange={(v) => setInviteRole(v as "member" | "admin")}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="member">Member</SelectItem>
									<SelectItem value="admin">Admin</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setInviteDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							onClick={inviteMember}
							disabled={isInviting || !inviteEmail.trim()}
						>
							{isInviting ? "Sending..." : "Send invitation"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, Shield, ShieldCheck, Users, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Panel } from "@/components/core/panel";
import { UserAvatar } from "@/components/core/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useTRPC } from "@/trpc/client";

interface User {
	id: string;
	email: string;
	firstName?: string | null;
	lastName?: string | null;
	image?: string | null;
}

interface Project {
	id: number;
	name: string;
}

interface Permission {
	id: number;
	projectId: number;
	userId: string;
	role: string;
	user: User;
}

interface PermissionsManagementProps {
	projectId?: number;
}

export default function PermissionsManagement({
	projectId,
}: PermissionsManagementProps) {
	const [selectedProject, setSelectedProject] = useState<number | null>(
		projectId || null,
	);
	const [selectedUser, setSelectedUser] = useState<string>("");
	const [selectedRole, setSelectedRole] = useState<"editor" | "reader">(
		"reader",
	);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

	const trpc = useTRPC();

	const { data: projectsData } = useQuery(
		trpc.user.getProjects.queryOptions({
			statuses: ["active", "archived"],
		}),
	);

	const projects = projectsData?.projects ?? [];

	// Get organization users
	const { data: orgUsers = [] } = useQuery(
		trpc.permissions.getOrganizationUsers.queryOptions(),
	);

	// Get permissions for selected project
	const { data: projectPermissions = [], refetch: refetchPermissions } =
		useQuery({
			...trpc.permissions.getProjectPermissions.queryOptions({
				projectId: selectedProject!,
			}),
			enabled: selectedProject !== null,
		});

	// Mutations
	const grantPermission = useMutation(
		trpc.permissions.grantPermission.mutationOptions({
			onSuccess: () => {
				toast.success("Permission granted successfully");
				refetchPermissions();
				setIsAddDialogOpen(false);
				setSelectedUser("");
				setSelectedRole("reader");
			},
			onError: (error) => {
				toast.error(error.message);
			},
		}),
	);

	const revokePermission = useMutation(
		trpc.permissions.revokePermission.mutationOptions({
			onSuccess: () => {
				toast.success("Permission revoked successfully");
				refetchPermissions();
			},
			onError: (error) => {
				toast.error(error.message);
			},
		}),
	);

	const handleGrantPermission = () => {
		if (!selectedProject || !selectedUser) return;

		grantPermission.mutate({
			projectId: selectedProject,
			userId: selectedUser,
			role: selectedRole,
		});
	};

	const handleRevokePermission = (userId: string) => {
		if (!selectedProject) return;

		revokePermission.mutate({
			projectId: selectedProject,
			userId,
		});
	};

	const getRoleIcon = (role?: string) => {
		switch (role) {
			case "editor":
				return <ShieldCheck className="w-3 h-3 text-green-500" />;
			case "reader":
				return <Shield className="w-3 h-3 text-blue-500" />;
			default:
				return null;
		}
	};

	const getRoleBadgeVariant = (role: string) => {
		switch (role) {
			case "editor":
				return "default" as const;
			case "reader":
				return "secondary" as const;
			default:
				return "outline" as const;
		}
	};

	// Filter out users who already have permissions
	const availableUsers = orgUsers.filter(
		(user: User) =>
			!projectPermissions.some((perm: Permission) => perm.userId === user.id),
	);

	return (
		<>
			{/* Project Selector - only show if no specific projectId provided */}
			{!projectId && (
				<div className="p-4 sm:flex">
					<dt className="font-semibold text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
						Select Project
					</dt>
					<dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
						<Select
							value={selectedProject?.toString() || ""}
							onValueChange={(value) => setSelectedProject(Number(value))}
						>
							<SelectTrigger className="w-full max-w-md border">
								<SelectValue placeholder="Choose a project to manage" />
							</SelectTrigger>
							<SelectContent>
								{projects.map((project: Project) => (
									<SelectItem key={project.id} value={project.id.toString()}>
										{project.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</dd>
				</div>
			)}

			{/* Permissions List */}
			{selectedProject && (
				<>
					<div className="p-4 sm:flex">
						<dt className="font-semibold text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
							Project Access
						</dt>
						<dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
							<div className="flex items-center gap-2">
								<Users className="w-4 h-4 text-muted-foreground" />
								<span className="text-gray-900 dark:text-gray-200">
									{projectPermissions.length} users with access
								</span>
							</div>

							<Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
								<Plus className="w-4 h-4 mr-2" />
								Add User
							</Button>
						</dd>
					</div>

					{/* Add User Panel */}
					<Panel open={isAddDialogOpen} setOpen={setIsAddDialogOpen}>
						<div className="p-6">
							<div className="flex items-start justify-between mb-6">
								<div>
									<h2 className="text-lg font-semibold">
										Grant Project Access
									</h2>
									<p className="text-sm text-muted-foreground">
										Add a user and assign their role for this project.
									</p>
								</div>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setIsAddDialogOpen(false)}
									className="h-8 w-8"
								>
									<X className="h-4 w-4" />
									<span className="sr-only">Close</span>
								</Button>
							</div>

							{availableUsers.length === 0 ? (
								<div className="text-center py-8">
									<Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
									<p className="text-sm text-muted-foreground">
										No users available to add
									</p>
									<p className="text-xs text-muted-foreground mt-2">
										All users already have access to this project
									</p>
								</div>
							) : (
								<div className="space-y-4">
									<div className="space-y-2">
										<label
											htmlFor="user-select"
											className="text-sm font-medium"
										>
											User
										</label>
										<Select
											value={selectedUser}
											onValueChange={setSelectedUser}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select a user" />
											</SelectTrigger>
											<SelectContent>
												{availableUsers.map((user: User) => (
													<SelectItem key={user.id} value={user.id}>
														<div className="flex items-center gap-2">
															<UserAvatar user={user} className="w-6 h-6" />
															<span>
																{user.firstName} {user.lastName} ({user.email})
															</span>
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<label
											htmlFor="role-select"
											className="text-sm font-medium"
										>
											Role
										</label>
										<Select
											value={selectedRole}
											onValueChange={(value) =>
												setSelectedRole(value as "editor" | "reader")
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="reader">
													<div className="flex items-center gap-2">
														<Shield className="w-4 h-4 text-blue-500" />
														<span>Reader - View only access</span>
													</div>
												</SelectItem>
												<SelectItem value="editor">
													<div className="flex items-center gap-2">
														<ShieldCheck className="w-4 h-4 text-green-500" />
														<span>Editor - Full read/write access</span>
													</div>
												</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="flex justify-end gap-2">
										<Button
											variant="outline"
											onClick={() => setIsAddDialogOpen(false)}
										>
											Cancel
										</Button>
										<Button
											onClick={handleGrantPermission}
											disabled={!selectedUser || grantPermission.isPending}
										>
											{grantPermission.isPending ? "Adding..." : "Add User"}
										</Button>
									</div>
								</div>
							)}
						</div>
					</Panel>

					{/* Permissions List */}
					<div className="divide-y border-t">
						{projectPermissions.length === 0 ? (
							<div className="p-4 sm:flex">
								<dt className="font-semibold text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
									Users
								</dt>
								<dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
									<div className="text-gray-500 dark:text-gray-400">
										<p className="text-sm">
											No users have access to this project yet.
										</p>
										<p className="text-xs mt-1">
											Use the "Add User" button above to grant access.
										</p>
									</div>
								</dd>
							</div>
						) : (
							<div className="p-4 sm:flex">
								<dt className="font-semibold text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
									Users
								</dt>
								<dd className="mt-1 sm:mt-0 sm:flex-auto space-y-4">
									{projectPermissions.map((permission: Permission) => (
										<div
											key={permission.id}
											className="flex items-center justify-between"
										>
											<div className="flex items-center gap-3">
												<UserAvatar
													user={permission.user}
													className="w-8 h-8"
												/>
												<div>
													<p className="font-medium text-sm">
														{permission.user.firstName}{" "}
														{permission.user.lastName}
													</p>
													<p className="text-xs text-gray-500 dark:text-gray-400">
														{permission.user.email}
													</p>
												</div>
											</div>
											<div className="flex items-center gap-3">
												<div className="flex items-center gap-2">
													{getRoleIcon(permission.role)}
													<Badge
														variant={getRoleBadgeVariant(permission.role)}
														className="text-xs capitalize"
													>
														{permission.role}
													</Badge>
												</div>
												<Button
													variant="ghost"
													size="sm"
													onClick={() =>
														handleRevokePermission(permission.userId)
													}
													disabled={revokePermission.isPending}
													className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
												>
													{revokePermission.isPending
														? "Removing..."
														: "Remove"}
												</Button>
											</div>
										</div>
									))}
								</dd>
							</div>
						)}
					</div>
				</>
			)}
		</>
	);
}

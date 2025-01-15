"use client";

import { logout } from "@/app/(dashboard)/[tenant]/settings/actions";
import type { Project } from "@/drizzle/types";
import type { Organization } from "@/lib/ops/auth";
import { getUserOrganizations } from "@/lib/utils/useUser";
import { ChevronsUpDown, Plus, User } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Skeleton } from "../ui/skeleton";

export const OrgSwitcher = ({
	activeOrgId,
}: {
	activeOrgId: string;
}) => {
	const [orgs, setOrgs] = useState<Organization[]>([]);
	const [loading, setLoading] = useState(false);

	const activeOrg = useMemo(
		() => orgs.find((org) => org.id === activeOrgId),
		[orgs, activeOrgId],
	);

	const fetchOrgs = useCallback(async () => {
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
		<DropdownMenu
			onOpenChange={(open) => {
				if (open) {
					fetchOrgs();
				}
			}}
		>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="flex max-w-[140px] items-center justify-between px-2 py-1 focus:outline-none"
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
				{loading ? (
					<div className="space-y-2 pl-1.5">
						<Skeleton className="h-5 w-[160px]" />
						<Skeleton className="h-5 w-[160px]" />
					</div>
				) : (
					orgs.map((org) => (
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
								<input
									type="hidden"
									name="slug"
									value={String(org.customData?.slug)}
								/>
								<button
									type="submit"
									className="flex w-full"
									disabled={activeOrg?.id === org.id}
								>
									{org.name}
								</button>
							</form>
						</DropdownMenuItem>
					))
				)}
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
					<form action={logout}>
						<button type="submit">Sign Out</button>
					</form>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export const ProjectSwitcher = ({
	projects,
}: {
	projects: Project[];
}) => {
	const { tenant, projectId } = useParams();

	if (!projectId) return null;

	const activeProject = projects.find((project) => project.id === +projectId);

	return (
		<>
			<svg
				fill="none"
				height="32"
				shapeRendering="geometricPrecision"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1"
				viewBox="0 0 24 24"
				width="40"
				className="ml-0.5 text-gray-300 dark:text-gray-700 xl:block"
			>
				<path d="M16.88 3.549L7.12 20.451" />
			</svg>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						className="flex max-w-[140px] items-center justify-between px-2 py-1 focus:outline-none"
					>
						<span className="truncate">{activeProject?.name}</span>
						<ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					{projects.map((project) => (
						<DropdownMenuItem key={project.id} asChild>
							<Link href={`/${tenant}/projects/${project.id}`}>
								{project.name}
							</Link>
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
};

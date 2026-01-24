"use client";

import { toast } from "sonner";
import EditableText from "@/components/form/editable-text";
import { authClient, useActiveOrganization } from "@/lib/auth/client";

export function WorkspaceSettings() {
	const { data: activeOrg, refetch } = useActiveOrganization();

	if (!activeOrg) {
		return null;
	}

	async function updateName(value: string) {
		if (!activeOrg?.id || !value.trim()) return;

		const result = await authClient.organization.update({
			organizationId: activeOrg.id,
			data: {
				name: value.trim(),
				slug: activeOrg.slug || "",
			},
		});

		if (result.error) {
			toast.error(result.error.message || "Failed to update workspace");
			throw new Error(result.error.message);
		}
		toast.success("Workspace updated");
		refetch();
	}

	async function updateSlug(value: string) {
		if (!activeOrg?.id || !value.trim()) return;

		const sanitizedSlug = value.toLowerCase().replace(/[^a-z0-9-]/g, "");

		const result = await authClient.organization.update({
			organizationId: activeOrg.id,
			data: {
				name: activeOrg.name,
				slug: sanitizedSlug,
			},
		});

		if (result.error) {
			toast.error(result.error.message || "Failed to update workspace");
			throw new Error(result.error.message);
		}
		toast.success("Workspace updated");
		refetch();
	}

	return (
		<>
			<div className="p-4 sm:flex items-center">
				<p className="font-semibold text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
					Name
				</p>
				<EditableText
					value={activeOrg.name}
					label="Workspace name"
					onChange={updateName}
				/>
			</div>

			<div className="p-4 sm:flex items-center">
				<p className="font-semibold text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
					Slug
				</p>
				<EditableText
					value={activeOrg.slug || ""}
					label="Workspace slug"
					onChange={updateSlug}
				/>
			</div>
		</>
	);
}

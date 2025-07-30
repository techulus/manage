"use client";

import { useOrganizationChange } from "@/hooks/use-organization-change";

export function OrganizationChangeHandler({
	children,
}: {
	children: React.ReactNode;
}) {
	useOrganizationChange();
	return <>{children}</>;
}

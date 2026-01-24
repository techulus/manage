"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function Billing() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Self-Hosted Instance</CardTitle>
				<CardDescription>
					You are running a self-hosted instance of Manage.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<p className="text-sm text-muted-foreground">
					No billing is required for self-hosted instances.
					All features are available.
				</p>
			</CardContent>
		</Card>
	);
}

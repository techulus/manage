"use client";

import { Protect } from "@clerk/nextjs";
import { TriangleAlert } from "lucide-react";

export function Protected({
	plan = "hobby",
	condition,
	children,
}: {
	condition: boolean;
	plan: string;
	children: React.ReactNode;
}) {
	return condition ? (
		<Protect
			plan={plan}
			fallback={
				<div className="flex items-center justify-center h-full gap-x-2">
					<TriangleAlert className="w-6 h-6 text-red-500" />
					<p className="text-sm text-red-500 font-semibold">
						Please upgrade to a paid plan to access this feature.
					</p>
				</div>
			}
		>
			{children}
		</Protect>
	) : (
		children
	);
}

"use client";

export function Protected({
	children,
}: {
	condition?: boolean;
	plan?: string;
	children: React.ReactNode;
}) {
	return children;
}

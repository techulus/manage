"use client";

import { PricingTable } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export function Billing() {
	const { systemTheme } = useTheme();
	const appearance = systemTheme === "dark" ? { baseTheme: dark } : undefined;

	return <PricingTable appearance={appearance} for="organization" />;
}

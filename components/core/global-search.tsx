"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { Button } from "../ui/button";

export function GlobalSearch() {
	const router = useRouter();
	const { tenant } = useParams();

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "/" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				router.push(`/${tenant}/search`);
			}
		};
		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, [router, tenant]);

	const handleSearchClick = () => {
		router.push(`/${tenant}/search`);
	};

	return (
		<Button
			variant="ghost"
			className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
			onClick={handleSearchClick}
		>
			<Search className="h-5 w-5 xl:mr-2" />
			<span className="hidden xl:inline-flex">Search everything...</span>
			<kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
				<span className="text-lg">⌘</span> <span className="text-xs">/</span>
			</kbd>
		</Button>
	);
}

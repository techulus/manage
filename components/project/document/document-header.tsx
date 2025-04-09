"use client";

import type { DocumentWithCreator } from "@/drizzle/types";
import { File } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export function DocumentHeader({
	document,
}: {
	document: DocumentWithCreator;
}) {
	const { tenant, projectId } = useParams();

	return (
		<div className="flex items-center justify-center gap-x-2 rounded-md p-1 hover:bg-muted">
			<Link
				href={`/${tenant}/projects/${projectId}/documents/${document.id}`}
				className="flex flex-col text-sm font-medium"
			>
				<File
					className="w-28 h-32 text-primary/60 -mt-2"
					strokeWidth={1}
					color="currentColor"
				/>
				<div className="text-md font-medium leading-6 truncate max-w-[120px] text-center">
					{document.name}
				</div>
			</Link>
		</div>
	);
}

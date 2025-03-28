import type { DocumentWithCreator } from "@/drizzle/types";
import { getOwner } from "@/lib/utils/useOwner";
import { File } from "lucide-react";
import Link from "next/link";

export async function DocumentHeader({
	document,
}: {
	document: DocumentWithCreator;
}) {
	const { orgSlug } = await getOwner();

	return (
		<div className="flex items-center justify-center gap-x-2 rounded-md p-1 hover:bg-muted">
			<Link
				href={`/${orgSlug}/projects/${document.projectId}/documents/${document.id}`}
				className="flex flex-col text-sm font-medium"
				prefetch={false}
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

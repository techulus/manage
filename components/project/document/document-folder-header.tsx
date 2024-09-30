import type { DocumentFolderWithDocuments } from "@/drizzle/types";
import { getOwner } from "@/lib/utils/useOwner";
import { FolderClosed } from "lucide-react";
import Link from "next/link";

export async function DocumentFolderHeader({
	documentFolder,
}: {
	documentFolder: DocumentFolderWithDocuments;
}) {
	const { orgSlug } = await getOwner();
	return (
		<div className="flex items-center justify-center gap-x-2 rounded-md hover:bg-white dark:hover:bg-gray-800 p-1">
			<Link
				href={`/${orgSlug}/projects/${documentFolder.projectId}/documents/folders/${documentFolder.id}`}
				className="flex flex-col text-sm font-medium"
				prefetch={false}
			>
				<FolderClosed
					className="w-32 h-32 text-primary/60 -mt-2"
					strokeWidth={1}
					color="currentColor"
				/>
				<div className="text-md font-medium leading-6 truncate max-w-[120px] text-center">
					{documentFolder.name}
				</div>
			</Link>
		</div>
	);
}

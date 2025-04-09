import {
	deleteBlob,
	reloadDocuments,
} from "@/app/(dashboard)/[tenant]/projects/[projectId]/documents/actions";
import { DeleteButton } from "@/components/form/button";
import { Badge } from "@/components/ui/badge";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { BlobWithCreater } from "@/drizzle/types";
import { getFileUrl } from "@/lib/blobStore";
import { File } from "lucide-react";
import Link from "next/link";

export const FileInfo = ({
	file,
	projectId,
	folderId,
}: {
	file: BlobWithCreater;
	projectId: number;
	folderId: number | null;
}) => {
	const fileUrl = getFileUrl(file);
	return (
		<ContextMenu>
			<ContextMenuTrigger>
				<div className="flex items-center justify-center gap-x-2 rounded-md hover:bg-muted p-1">
					<Link href={fileUrl} target="_blank" rel="noopener noreferrer">
						<div className="relative">
							<File
								className="w-28 h-32 text-primary/60 -mt-2"
								strokeWidth={1}
								color="currentColor"
							/>
							<div className="text-md font-medium leading-6 truncate max-w-[120px] text-center">
								{file.name}
							</div>
							<Badge className="absolute left-2 top-16 uppercase">
								{file.contentType.split("/")?.[1] ?? "?"}
							</Badge>
						</div>
					</Link>
				</div>
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem className="p-0">
					<form
						action={async () => {
							"use server";
							await deleteBlob(file, projectId);
							await reloadDocuments(+projectId, folderId);
						}}
						className="w-full"
					>
						<DeleteButton action="Delete" compact className="w-full p-0" />
					</form>
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
};

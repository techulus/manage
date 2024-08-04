import EmptyState from "@/components/core/empty-state";
import PageTitle from "@/components/layout/page-title";
import { DocumentFolderHeader } from "@/components/project/document/document-folder-header";
import { DocumentHeader } from "@/components/project/document/document-header";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { document, project } from "@/drizzle/schema";
import { database } from "@/lib/utils/useDatabase";
import { and, eq, isNull } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
	params: {
		projectId: string;
	};
};

export default async function ProjectDocuments({ params }: Props) {
	const { projectId } = params;

	const db = await database();
	const data = await db.query.project
		.findFirst({
			where: and(eq(project.id, +projectId)),
			with: {
				documents: {
					where: isNull(document.folderId),
					with: {
						creator: {
							columns: {
								firstName: true,
								imageUrl: true,
							},
						},
					},
				},
				documentFolders: {
					with: {
						creator: {
							columns: {
								firstName: true,
								imageUrl: true,
							},
						},
						// I can't get count query to work, so I'm just selecting the id :(
						documents: {
							columns: {
								id: true,
							},
						},
						files: {
							columns: {
								id: true,
							},
						},
					},
				},
			},
		})
		.execute();

	if (!data) {
		return notFound();
	}

	return (
		<>
			<PageTitle
				title="Docs & Files"
				actions={
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button>New</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem>
								<Link
									className="w-full"
									href={`/console/projects/${projectId}/documents/new`}
									prefetch={false}
								>
									Document
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Link
									className="w-full"
									href={`/console/projects/${projectId}/documents/folders/new`}
									prefetch={false}
								>
									Folder
								</Link>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				}
			/>

			<div className="mx-auto my-12 -mt-6 max-w-5xl px-4 lg:px-0">
				<div className="flex flex-col space-y-4">
					{data.documents.length || data.documentFolders.length ? (
						<ul className="grid grid-cols-1 gap-x-4 gap-y-4 lg:grid-cols-2">
							{data.documents.map((document) => (
								<div
									key={document.id}
									className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800"
								>
									{/* @ts-ignore */}
									<DocumentHeader document={document} />
								</div>
							))}
							{data.documentFolders.map((folder) => (
								<div
									key={folder.id}
									className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800"
								>
									<DocumentFolderHeader documentFolder={folder} />
								</div>
							))}
						</ul>
					) : null}

					<EmptyState
						show={!data.documents.length && !data.documentFolders.length}
						label="document"
						createLink={`/console/projects/${projectId}/documents/new`}
					/>
				</div>
			</div>
		</>
	);
}

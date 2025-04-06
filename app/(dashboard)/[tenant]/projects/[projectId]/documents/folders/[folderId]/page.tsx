import EmptyState from "@/components/core/empty-state";
import { MarkdownView } from "@/components/core/markdown-view";
import PageSection from "@/components/core/section";
import { DeleteButton } from "@/components/form/button";
import PageTitle from "@/components/layout/page-title";
import { CommentsSection } from "@/components/project/comment/comments-section";
import { DocumentHeader } from "@/components/project/document/document-header";
import { FileInfo } from "@/components/project/file/info";
import { FileUploader } from "@/components/project/file/uploader";
import { buttonVariants } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { documentFolder } from "@/drizzle/schema";
import type { FolderWithContents } from "@/drizzle/types";
import { database } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { eq } from "drizzle-orm";
import { CircleEllipsisIcon, FilePlus2 } from "lucide-react";
import Link from "next/link";
import { deleteDocumentFolder, reloadDocuments } from "../../actions";

type Props = {
	params: Promise<{
		projectId: string;
		folderId: number;
	}>;
};

export default async function FolderDetails(props: Props) {
	const params = await props.params;
	const { orgSlug } = await getOwner();
	const { projectId, folderId } = params;

	const db = await database();
	const folder: FolderWithContents | undefined =
		await db.query.documentFolder.findFirst({
			where: eq(documentFolder.id, Number(folderId)),
			with: {
				documents: {
					with: {
						creator: {
							columns: {
								firstName: true,
								imageUrl: true,
							},
						},
					},
				},
				files: {
					with: {
						creator: {
							columns: {
								firstName: true,
								imageUrl: true,
							},
						},
					},
				},
			},
		});

	if (!folder) {
		return null;
	}

	return (
		<>
			<PageTitle
				title={folder?.name}
				subTitle="Documents"
				actionLabel="Edit"
				actionLink={`/${orgSlug}/projects/${projectId}/documents/folders/${folderId}/edit`}
			/>

			<PageSection topInset>
				{folder.description ? (
					<div className="flex flex-col px-4 py-2">
						<MarkdownView content={folder.description ?? ""} />
					</div>
				) : null}

				<div className="flex justify-between px-4 py-3">
					{/* Left buttons */}
					<div className="isolate inline-flex sm:space-x-3">
						<span className="inline-flex space-x-1">
							<FileUploader
								folderId={Number(folderId)}
								projectId={+projectId}
								reloadDocuments={reloadDocuments}
							/>
						</span>
					</div>

					{/* Right buttons */}
					<nav aria-label="Pagination">
						<span className="isolate inline-flex">
							<Link
								href={`/${orgSlug}/projects/${projectId}/documents/folders/${folderId}/new`}
								className={buttonVariants({ variant: "link" })}
								prefetch={false}
							>
								<FilePlus2 className="mr-1 h-5 w-5" /> Document
								<span className="sr-only">, document</span>
							</Link>

							<DropdownMenu>
								<DropdownMenuTrigger>
									<CircleEllipsisIcon className="h-6 w-6" />
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem className="m-0 p-0">
										<form action={deleteDocumentFolder}>
											<input type="hidden" name="id" value={folderId} />
											<input type="hidden" name="projectId" value={projectId} />
											<DeleteButton
												action="Delete folder"
												className="w-full"
												compact
											/>
										</form>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</span>
					</nav>
				</div>
			</PageSection>

			<div className="mx-auto max-w-7xl space-y-8 px-4 lg:px-0">
				<div className="flex flex-col space-y-4">
					{folder.documents.length || folder.files.length ? (
						<ul className="grid grid-cols-2 gap-x-4 gap-y-4 md:grid-cols-4 lg:grid-cols-6">
							{folder.documents.map((document) => (
								<div key={document.id}>
									{/* @ts-ignore */}
									<DocumentHeader document={document} />
								</div>
							))}

							{folder.files.length
								? folder.files.map((file) => (
										<div key={file.key}>
											<FileInfo
												file={file}
												projectId={+projectId}
												folderId={folderId ? +folderId : null}
											/>
										</div>
									))
								: null}
						</ul>
					) : null}

					<EmptyState
						show={!folder.documents.length && !folder.files.length}
						label="document"
						createLink={`/${orgSlug}/projects/${projectId}/documents/new`}
					/>
				</div>

				<div className="py-8">
					{/* @ts-ignore */}
					<CommentsSection
						type="folder"
						parentId={folderId}
						projectId={+projectId}
					/>
				</div>
			</div>
		</>
	);
}

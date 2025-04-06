import { MarkdownView } from "@/components/core/markdown-view";
import PageSection from "@/components/core/section";
import { DeleteButton } from "@/components/form/button";
import PageTitle from "@/components/layout/page-title";
import { CommentsSection } from "@/components/project/comment/comments-section";
import { document } from "@/drizzle/schema";
import { database } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { eq } from "drizzle-orm";
import { deleteDocument } from "../actions";

type Props = {
	params: Promise<{
		projectId: string;
		documentId: string;
	}>;
};

export default async function DocumentDetails(props: Props) {
	const params = await props.params;
	const { projectId, documentId } = params;

	const { orgSlug } = await getOwner();
	const db = await database();
	const documentDetails = await db.query.document.findFirst({
		where: eq(document.id, +documentId),
		with: {
			folder: true,
		},
	});

	if (!documentDetails) {
		return null;
	}

	return (
		<>
			<PageTitle
				title={documentDetails.name}
				subTitle={
					documentDetails.folder
						? `Documents / ${documentDetails.folder?.name}`
						: "Document"
				}
				actionLabel="Edit"
				actionLink={`/${orgSlug}/projects/${projectId}/documents/${documentId}/edit`}
			/>

			<PageSection topInset>
				<div className="p-4 lg:p-8">
					<MarkdownView content={documentDetails.markdownContent} />
				</div>
			</PageSection>

			<PageSection bottomMargin={false}>
				<div className="flex justify-between p-1">
					{/* Left buttons */}
					<div className="isolate inline-flex sm:space-x-3">
						<span className="inline-flex space-x-1" />
					</div>

					{/* Right buttons */}
					<nav aria-label="Pagination">
						<span className="isolate inline-flex">
							<form
								action={async () => {
									"use server";
									await deleteDocument(
										documentId,
										projectId,
										documentDetails?.markdownContent,
										documentDetails?.folderId,
									);
								}}
							>
								<DeleteButton />
							</form>
						</span>
					</nav>
				</div>
			</PageSection>

			<div className="mx-auto max-w-7xl py-8">
				{/* @ts-ignore */}
				<CommentsSection
					type="document"
					parentId={+documentId}
					projectId={+projectId}
				/>
			</div>
		</>
	);
}

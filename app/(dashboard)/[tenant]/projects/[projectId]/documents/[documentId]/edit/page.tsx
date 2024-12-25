import PageSection from "@/components/core/section";
import { SaveButton } from "@/components/form/button";
import DocumentForm from "@/components/form/document";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { getOwner } from "@/lib/utils/useOwner";
import { getDocumentById } from "@/lib/utils/useProjects";
import Link from "next/link";
import { updateDocument } from "../../actions";

type Props = {
	params: Promise<{
		projectId: string;
		documentId: string;
	}>;
};

export default async function EditDocument(props: Props) {
    const params = await props.params;
    const { orgSlug } = await getOwner();
    const document = await getDocumentById(params.documentId);
    const backUrl = `/${orgSlug}/projects/${params.projectId}/documents/${document.id}`;

    return (
		<>
			<PageTitle title="Update Document" backUrl={backUrl} />

			<PageSection topInset>
				<form action={updateDocument}>
					<input type="hidden" name="id" defaultValue={params.documentId} />
					<input
						type="hidden"
						name="projectId"
						defaultValue={params.projectId}
					/>
					{document.folderId && (
						<input
							type="hidden"
							name="folderId"
							defaultValue={document.folderId}
						/>
					)}
					<CardContent>
						<DocumentForm item={document} />
					</CardContent>
					<CardFooter>
						<div className="ml-auto flex items-center justify-end gap-x-6">
							<Link
								href={backUrl}
								className={buttonVariants({ variant: "ghost" })}
								prefetch={false}
							>
								Cancel
							</Link>
							<SaveButton />
						</div>
					</CardFooter>
				</form>
			</PageSection>
		</>
	);
}

import PageSection from "@/components/core/section";
import { SaveButton } from "@/components/form/button";
import DocumentForm from "@/components/form/document";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { getOwner } from "@/lib/utils/useOwner";
import Link from "next/link";
import { createDocument } from "../../../actions";

type Props = {
	params: Promise<{
		projectId: string;
		folderId?: string;
	}>;
};

export default async function CreateDocument(props: Props) {
	const params = await props.params;
	const { orgSlug } = await getOwner();
	const backUrl = `/${orgSlug}/projects/${params.projectId}/documents/folders/${params.folderId}`;
	return (
		<>
			<PageTitle title="Create Document" />
			<PageSection topInset>
				<form action={createDocument}>
					<input
						type="hidden"
						name="projectId"
						defaultValue={params.projectId}
					/>
					<input type="hidden" name="folderId" defaultValue={params.folderId} />
					<CardContent>
						<DocumentForm />
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

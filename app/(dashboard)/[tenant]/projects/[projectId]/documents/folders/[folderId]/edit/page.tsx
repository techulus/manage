import PageSection from "@/components/core/section";
import { SaveButton } from "@/components/form/button";
import SharedForm from "@/components/form/shared";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { documentFolder } from "@/drizzle/schema";
import { database } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { updateDocumentFolder } from "../../../actions";

type Props = {
	params: Promise<{
		projectId: string;
		folderId: string;
	}>;
};

export default async function EditDocumentFolder(props: Props) {
	const params = await props.params;
	const { orgSlug } = await getOwner();
	const backUrl = `/${orgSlug}/projects/${params.projectId}/documents/folders/${params.folderId}`;
	const db = await database();
	const folder = await db.query.documentFolder.findFirst({
		where: eq(documentFolder.id, +params.folderId),
	});

	return (
		<>
			<PageTitle title="Update Folder" />

			<PageSection topInset>
				<form action={updateDocumentFolder}>
					<input
						type="hidden"
						name="projectId"
						defaultValue={params.projectId}
					/>
					<input type="hidden" name="id" defaultValue={params.folderId} />
					<CardContent>
						<SharedForm showDueDate={false} item={folder} />
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

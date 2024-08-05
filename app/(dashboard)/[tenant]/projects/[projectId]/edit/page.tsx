import PageSection from "@/components/core/section";
import { SaveButton } from "@/components/form/button";
import SharedForm from "@/components/form/shared";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { getOwner } from "@/lib/utils/useOwner";
import { getProjectById } from "@/lib/utils/useProjects";
import Link from "next/link";
import { updateProject } from "../../actions";

interface Props {
	params: {
		projectId: string;
	};
}

export default async function EditProject({ params }: Props) {
	const { projectId } = params;

	const project = await getProjectById(projectId);
	const { orgSlug } = await getOwner();

	return (
		<>
			<PageTitle title={project.name} backUrl={`/${orgSlug}/projects`} />

			<PageSection topInset>
				<form action={updateProject}>
					<CardContent>
						<input type="hidden" name="id" defaultValue={projectId} />
						<SharedForm item={project} />
					</CardContent>
					<CardFooter>
						<div className="flex items-center justify-end gap-x-6">
							<Link
								href={`/${orgSlug}/projects`}
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

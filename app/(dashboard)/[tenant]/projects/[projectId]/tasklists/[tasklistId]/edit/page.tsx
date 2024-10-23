import PageSection from "@/components/core/section";
import { SaveButton } from "@/components/form/button";
import SharedForm from "@/components/form/shared";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { getOwner } from "@/lib/utils/useOwner";
import { getTaskListById } from "@/lib/utils/useProjects";
import Link from "next/link";
import { updateTaskList } from "../../actions";

type Props = {
	params: Promise<{
		projectId: string;
		tasklistId: string;
	}>;
};

export default async function EditTaskList(props: Props) {
    const params = await props.params;
    const { orgSlug } = await getOwner();
    const tasklist = await getTaskListById(params.tasklistId);

    const backUrl = `/${orgSlug}/projects/${params.projectId}/tasklists`;

    return (
		<>
			<PageTitle title="Update Task list" backUrl={backUrl} />

			<PageSection topInset>
				<form action={updateTaskList}>
					<input type="hidden" name="id" defaultValue={params.tasklistId} />
					<input
						type="hidden"
						name="projectId"
						defaultValue={params.projectId}
					/>
					<CardContent>
						<SharedForm item={tasklist} />
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

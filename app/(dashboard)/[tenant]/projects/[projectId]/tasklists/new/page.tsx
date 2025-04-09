import PageSection from "@/components/core/section";
import { SaveButton } from "@/components/form/button";
import SharedForm from "@/components/form/shared";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { getOwner } from "@/lib/utils/useOwner";
import Link from "next/link";
import { createTaskList } from "../actions";

type Props = {
	params: Promise<{
		projectId: string;
	}>;
};

export default async function CreateTaskList(props: Props) {
	const params = await props.params;
	const { orgSlug } = await getOwner();
	const backUrl = `/${orgSlug}/projects/${params.projectId}/tasklists`;
	return (
		<>
			<PageTitle title="Create task list" />

			<PageSection topInset>
				<form action={createTaskList}>
					<input
						type="hidden"
						name="projectId"
						defaultValue={params.projectId}
					/>
					<CardContent>
						<SharedForm />
					</CardContent>
					<CardFooter>
						<div className="ml-auto flex items-center justify-end gap-x-6">
							<Link
								href={backUrl}
								className={buttonVariants({ variant: "ghost" })}
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

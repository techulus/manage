import PageSection from "@/components/core/section";
import { SaveButton } from "@/components/form/button";
import SharedForm from "@/components/form/shared";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { getOwner } from "@/lib/utils/useOwner";
import Link from "next/link";
import { createProject } from "../actions";

export default async function CreateProject() {
	const { orgSlug } = await getOwner();
	return (
		<>
			<PageTitle title="Create Project" />
			<PageSection topInset>
				<form action={createProject}>
					<CardContent>
						<SharedForm />
					</CardContent>
					<CardFooter>
						<div className="ml-auto flex items-center justify-end gap-x-6">
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

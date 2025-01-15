import PageSection from "@/components/core/section";
import { SaveButton } from "@/components/form/button";
import EventForm from "@/components/form/event";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { getOwner } from "@/lib/utils/useOwner";
import { allUsers } from "@/lib/utils/useUser";
import Link from "next/link";
import { createEvent } from "../actions";

type Props = {
	params: Promise<{
		projectId: string;
	}>;
	searchParams: Promise<{
		on: string;
	}>;
};

export default async function CreateEvent(props: Props) {
	const params = await props.params;
	const searchParams = await props.searchParams;
	const { orgSlug } = await getOwner();
	const backUrl = `/${orgSlug}/projects/${params.projectId}/events`;

	const users = await allUsers();

	return (
		<>
			<PageTitle title="Create Event" backUrl={backUrl} />

			<PageSection topInset>
				<form action={createEvent}>
					<input
						type="hidden"
						name="projectId"
						defaultValue={params.projectId}
					/>
					<CardContent>
						<EventForm users={users} on={searchParams.on} />
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

import PageSection from "@/components/core/section";
import EventForm from "@/components/form/event";
import PageTitle from "@/components/layout/page-title";
import { getOwner } from "@/lib/utils/useOwner";
import { allUsers } from "@/lib/utils/useUser";

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

	const users = await allUsers();

	return (
		<>
			<PageTitle title="Create Event" />

			<PageSection topInset>
				<EventForm
					users={users}
					on={searchParams.on}
					projectId={params.projectId}
				/>
			</PageSection>
		</>
	);
}

import PageSection from "@/components/core/section";
import EventForm from "@/components/form/event";
import PageTitle from "@/components/layout/page-title";

export default async function CreateEvent() {
	return (
		<>
			<PageTitle title="Create Event" />

			<PageSection topInset>
				<EventForm />
			</PageSection>
		</>
	);
}

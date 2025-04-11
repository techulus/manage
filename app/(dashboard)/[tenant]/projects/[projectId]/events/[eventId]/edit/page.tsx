import PageSection from "@/components/core/section";
import EventForm from "@/components/form/event";
import PageTitle from "@/components/layout/page-title";
import { calendarEvent } from "@/drizzle/schema";
import { database } from "@/lib/utils/useDatabase";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

type Props = {
	params: Promise<{
		projectId: string;
		eventId: string;
	}>;
};

export default async function EditEvent(props: Props) {
	const params = await props.params;
	const { eventId } = params;

	const db = await database();
	const event = await db.query.calendarEvent.findFirst({
		where: eq(calendarEvent.id, +eventId),
		with: {
			creator: {
				columns: {
					id: true,
					firstName: true,
					imageUrl: true,
				},
			},
			invites: {
				with: {
					user: {
						columns: {
							firstName: true,
							imageUrl: true,
						},
					},
				},
			},
		},
	});

	if (!event) {
		return notFound();
	}

	return (
		<>
			<PageTitle title="Edit Event" />

			<PageSection topInset>
				<EventForm item={event} />
			</PageSection>
		</>
	);
}

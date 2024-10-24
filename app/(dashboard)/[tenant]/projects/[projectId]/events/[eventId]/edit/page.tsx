import PageSection from "@/components/core/section";
import { SaveButton } from "@/components/form/button";
import EventForm from "@/components/form/event";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { calendarEvent } from "@/drizzle/schema";
import { database } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { allUsers } from "@/lib/utils/useUser";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateEvent } from "../../actions";

type Props = {
	params: Promise<{
		projectId: string;
		eventId: string;
	}>;
};

export default async function EditEvent(props: Props) {
    const params = await props.params;
    const { orgSlug } = await getOwner();
    const { projectId, eventId } = params;

    const users = await allUsers();
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

    const backUrl = `/${orgSlug}/projects/${projectId}/events?date=${event.start.toISOString()}`;

    return (
		<>
			<PageTitle title="Edit Event" backUrl={backUrl} />

			<PageSection topInset>
				<form action={updateEvent}>
					<input type="hidden" name="id" defaultValue={eventId} />
					<input type="hidden" name="projectId" defaultValue={projectId} />
					<CardContent>
						<EventForm item={event} users={users} />
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

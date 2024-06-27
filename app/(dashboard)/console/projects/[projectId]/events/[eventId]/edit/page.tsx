import { ContentBlock } from "@/components/core/content-block";
import { SaveButton } from "@/components/form/button";
import EventForm from "@/components/form/event";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { calendarEvent } from "@/drizzle/schema";
import { database } from "@/lib/utils/useDatabase";
import { allUser } from "@/lib/utils/useOwner";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateEvent } from "../../actions";

type Props = {
  params: {
    projectId: string;
    eventId: string;
  };
};

export default async function EditEvent({ params }: Props) {
  const { projectId, eventId } = params;

  const users = await allUser();
  const event = await database().query.calendarEvent.findFirst({
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

  const backUrl = `/console/projects/${projectId}/events?date=${event.start.toISOString()}`;

  return (
    <>
      <PageTitle title="Edit Event" backUrl={backUrl} />
      <form action={updateEvent}>
        <input type="hidden" name="id" defaultValue={eventId} />
        <input type="hidden" name="projectId" defaultValue={projectId} />
        <ContentBlock>
          <CardContent>
            <EventForm item={event} users={users} />
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
        </ContentBlock>
      </form>
    </>
  );
}

import { ContentBlock } from "@/components/core/content-block";
import { SaveButton } from "@/components/form/button";
import EventForm from "@/components/form/event";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { calendarEvent } from "@/drizzle/schema";
import { database } from "@/lib/utils/useDatabase";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { rrulestr } from "rrule";
import { createEvent } from "../../actions";

type Props = {
  params: {
    projectId: string;
    eventId: string;
  };
};

export default async function CreateEvent({ params }: Props) {
  const { projectId, eventId } = params;

  const event = await database().query.calendarEvent.findFirst({
    where: eq(calendarEvent.id, +eventId),
  });

  if (!event) {
    return notFound();
  }

  const backUrl = `/console/projects/${projectId}/events?date=${event.start.toISOString()}`;

  const rrule = event?.repeatRule ? rrulestr(event.repeatRule) : null;
  console.log("rrule", rrule?.toText());

  return (
    <>
      <PageTitle title="Edit Event" backUrl={backUrl} />
      <form action={createEvent}>
        <input type="hidden" name="projectId" defaultValue={params.projectId} />
        <ContentBlock>
          <CardContent>
            <EventForm item={event} />
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

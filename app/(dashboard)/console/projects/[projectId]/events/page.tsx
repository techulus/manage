import EmptyState from "@/components/core/empty-state";
import PageTitle from "@/components/layout/page-title";
import EventsList from "@/components/project/events/events-list";
import { calendarEvent } from "@/drizzle/schema";
import { database } from "@/lib/utils/useDatabase";
import { and, eq, gte, lte } from "drizzle-orm";

type Props = {
  params: {
    projectId: string;
  };
  searchParams: {
    date: string;
  };
};

export default async function EventDetails({ params, searchParams }: Props) {
  const { projectId } = params;
  const { date } = searchParams;

  const selectedDate = date ? new Date(date) : new Date();

  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(23, 59, 59, 999);

  const events = await database()
    .query.calendarEvent.findMany({
      where: and(
        eq(calendarEvent.projectId, +projectId),
        gte(calendarEvent.start, startOfDay),
        lte(calendarEvent.start, endOfDay)
      ),
      with: {
        creator: {
          columns: {
            firstName: true,
            imageUrl: true,
          },
        },
      },
    })
    .execute();

  return (
    <>
      <PageTitle
        title="Events"
        backUrl={`/console/projects/${projectId}`}
        actionLabel="New"
        actionLink={`/console/projects/${projectId}/events/new`}
      />

      <div className="mx-auto my-12 max-w-5xl px-4 lg:px-0">
        <EmptyState
          show={!events.length}
          label="event"
          createLink={`/console/projects/${projectId}/events/new`}
        />

        <EventsList events={events} />
      </div>
    </>
  );
}

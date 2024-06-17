import PageTitle from "@/components/layout/page-title";
import EventsList from "@/components/project/events/events-list";
import { calendarEvent } from "@/drizzle/schema";
import { getEndOfDay, getStartOfDay } from "@/lib/utils/time";
import { database } from "@/lib/utils/useDatabase";
import { and, between, eq, gte, isNotNull, lte, or } from "drizzle-orm";

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

  const startOfDay = getStartOfDay(selectedDate);
  const endOfDay = getEndOfDay(selectedDate);

  const events = await database()
    .query.calendarEvent.findMany({
      where: and(
        eq(calendarEvent.projectId, +projectId),
        or(
          between(calendarEvent.start, startOfDay, endOfDay),
          between(calendarEvent.end, startOfDay, endOfDay),
          and(
            lte(calendarEvent.start, startOfDay),
            gte(calendarEvent.end, endOfDay)
          ),
          isNotNull(calendarEvent.repeatRule)
        )
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
      >
        <div className="font-medium text-gray-500">
          {selectedDate.toDateString()}
        </div>
      </PageTitle>

      <div className="mx-auto my-12 max-w-5xl px-4 lg:px-0">
        <EventsList
          events={events}
          projectId={projectId}
          date={selectedDate.toISOString()}
        />
      </div>
    </>
  );
}

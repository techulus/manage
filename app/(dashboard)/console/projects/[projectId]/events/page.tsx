import PageTitle from "@/components/layout/page-title";
import { CommentsSection } from "@/components/project/comment/comments-section";
import EventsCalendar from "@/components/project/events/events-calendar";
import { calendarEvent } from "@/drizzle/schema";
import { getEndOfDay, getStartOfDay } from "@/lib/utils/time";
import { database } from "@/lib/utils/useDatabase";
import {
  and,
  asc,
  between,
  desc,
  eq,
  gte,
  isNotNull,
  lte,
  or,
} from "drizzle-orm";

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
  const dayCommentId = `${projectId}${selectedDate.getFullYear()}${selectedDate.getMonth()}${selectedDate.getDate()}`;

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
      orderBy: [desc(calendarEvent.start), asc(calendarEvent.allDay)],
      with: {
        creator: {
          columns: {
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
    })
    .execute();

  return (
    <>
      <PageTitle
        title="Events"
        actionLabel="New"
        actionLink={`/console/projects/${projectId}/events/new`}
      >
        <div className="font-medium text-gray-500">
          {selectedDate.toDateString()}
        </div>
      </PageTitle>

      <div className="mx-auto my-12 max-w-7xl space-y-12 px-4 lg:px-0">
        <div className="flex w-full rounded-lg border bg-white dark:bg-black">
          <EventsCalendar
            projectId={projectId}
            events={events}
            selectedDate={selectedDate.toISOString()}
          />
        </div>

        <CommentsSection type="event" parentId={dayCommentId} />
      </div>
    </>
  );
}

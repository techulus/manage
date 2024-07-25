import PageSection from "@/components/core/section";
import PageTitle from "@/components/layout/page-title";
import { CommentsSection } from "@/components/project/comment/comments-section";
import EventsCalendar from "@/components/project/events/events-calendar";
import { Button, buttonVariants } from "@/components/ui/button";
import { calendarEvent } from "@/drizzle/schema";
import { getEndOfDay, getStartOfDay } from "@/lib/utils/time";
import { database } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
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
import Link from "next/link";

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
  const { userId, ownerId } = await getOwner();

  const selectedDate = date ? new Date(date) : new Date();
  const dayCommentId = `${projectId}${selectedDate.getFullYear()}${selectedDate.getMonth()}${selectedDate.getDate()}`;

  const startOfDay = getStartOfDay(selectedDate);
  const endOfDay = getEndOfDay(selectedDate);

  const db = await database();
  const events = await db.query.calendarEvent
    .findMany({
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
    })
    .execute();

  const calendarUrl = `/api/calendar/${ownerId}/${projectId}/calendar.ics`;

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
        <Link
          href={calendarUrl}
          className={buttonVariants({ variant: "link" })}
        >
          Get Calendar URL
        </Link>
      </PageTitle>

      <PageSection topInset>
        <div className="flex w-full rounded-lg bg-white dark:bg-black">
          <EventsCalendar
            projectId={projectId}
            userId={userId}
            events={events}
            selectedDate={selectedDate.toISOString()}
          />
        </div>
      </PageSection>

      <div className="mx-auto max-w-5xl p-4 lg:p-0">
        {/* @ts-ignore */}
        <CommentsSection
          type="event"
          parentId={dayCommentId}
          projectId={+projectId}
        />
      </div>
    </>
  );
}

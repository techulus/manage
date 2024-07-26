import PageSection from "@/components/core/section";
import PageTitle from "@/components/layout/page-title";
import { CommentsSection } from "@/components/project/comment/comments-section";
import EventsCalendar from "@/components/project/events/events-calendar";
import { buttonVariants } from "@/components/ui/button";
import { calendarEvent } from "@/drizzle/schema";
import { database } from "@/lib/utils/useDatabase";
import { getOwner, getTimezone } from "@/lib/utils/useOwner";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
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
import { RssIcon } from "lucide-react";
import Link from "next/link";

type Props = {
  params: {
    projectId: string;
  };
  searchParams: {
    date: string;
  };
};

dayjs.extend(utc);
dayjs.extend(timezone);

export default async function EventDetails({ params, searchParams }: Props) {
  const { projectId } = params;
  const { date } = searchParams;
  const { userId, ownerId } = await getOwner();

  const timezone = getTimezone();

  const selectedDate = date ? dayjs(date).utc() : dayjs().utc();
  const dayCommentId = `${projectId}${selectedDate.year()}${selectedDate.month()}${selectedDate.date()}`;

  const startOfDay = selectedDate.startOf("day").toDate();
  const endOfDay = selectedDate.endOf("day").toDate();

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

  const calendarSubscriptionUrl = `/api/calendar/${ownerId}/${projectId}/calendar.ics`;

  return (
    <>
      <PageTitle
        title="Events"
        actionLabel="New"
        actionLink={`/console/projects/${projectId}/events/new`}
      >
        <div className="font-medium text-gray-500">
          {selectedDate.tz(timezone).format("dddd, MMMM D, YYYY")}
        </div>
      </PageTitle>

      <PageSection topInset>
        <div className="flex justify-between p-1">
          {/* Left buttons */}
          <div className="isolate inline-flex sm:space-x-3">
            <span className="inline-flex space-x-1">
              <Link
                href={calendarSubscriptionUrl}
                className={buttonVariants({ variant: "link" })}
              >
                <RssIcon className="mr-2 h-5 w-5" />
                Calendar Subscription
              </Link>
            </span>
          </div>
        </div>
      </PageSection>

      <PageSection>
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

import { ContentBlock } from "@/components/core/content-block";
import PageTitle from "@/components/layout/page-title";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { activity } from "@/drizzle/schema";
import { cn } from "@/lib/utils";
import { database } from "@/lib/utils/useDatabase";
import { and, desc, eq } from "drizzle-orm";
import { PencilIcon, PlusCircleIcon, TrashIcon } from "lucide-react";

type Props = {
  params: {
    projectId: string;
  };
};

async function ActivityItem({ id, isLast }: { id: number; isLast: boolean }) {
  const activityItem = await database()
    .query.activity.findFirst({
      where: and(eq(activity.id, id)),
      with: {
        actor: {
          columns: {
            id: true,
            firstName: true,
            imageUrl: true,
          },
        },
      },
    })
    .execute();

  if (!activityItem) {
    return null;
  }

  return (
    <li key={activityItem.id}>
      <div className={cn("relative pb-8", isLast ? "pb-2" : "")}>
        {!isLast ? (
          <span
            className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"
            aria-hidden="true"
          />
        ) : null}
        <div className="relative flex items-start space-x-3">
          <>
            <div className="relative">
              {activityItem.actor?.imageUrl ? (
                <Avatar className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 ring-8 ring-white">
                  <AvatarImage src={activityItem.actor.imageUrl} />
                  <AvatarFallback>
                    {activityItem.actor?.firstName ?? "User"}
                  </AvatarFallback>
                </Avatar>
              ) : null}

              <span className="absolute -bottom-0.5 -right-1 rounded-tl bg-white px-0.5 py-px">
                {activityItem.action === "created" ? (
                  <PlusCircleIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                ) : null}
                {activityItem.action === "updated" ? (
                  <PencilIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                ) : null}
                {activityItem.action === "deleted" ? (
                  <TrashIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                ) : null}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm">
                <a
                  href={activityItem.actor.id}
                  className="font-medium text-gray-900"
                >
                  {activityItem.actor.firstName}
                </a>
              </div>
              <div className="flex w-full flex-col md:flex-row md:justify-between">
                {activityItem.message ? (
                  <div className="mt-1 text-sm text-gray-700">
                    <p className="text-sm font-semibold">
                      {activityItem.message}
                    </p>
                  </div>
                ) : null}
                <p className="mt-0.5 text-sm text-gray-500">
                  {activityItem.createdAt.toLocaleTimeString()},{" "}
                  {activityItem.createdAt.toDateString()}
                </p>
              </div>
            </div>
          </>
        </div>
      </div>
    </li>
  );
}

export default async function ActivityDetails({ params }: Props) {
  const { projectId } = params;

  const activities = await database()
    .query.activity.findMany({
      where: eq(activity.projectId, +projectId),
      orderBy: [desc(activity.createdAt)],
      columns: {
        id: true,
      },
    })
    .execute();

  return (
    <>
      <PageTitle title="Activity" />

      <ContentBlock className="mx-auto my-12 max-w-5xl space-y-12 px-4 lg:px-0 xl:-mt-6">
        {activities.length ? (
          <ul role="list" className="py-4 md:p-6">
            {activities.map((activityItem, activityItemIdx) => {
              return (
                // @ts-ignore
                <ActivityItem
                  key={activityItem.id}
                  id={activityItem.id}
                  isLast={activityItemIdx === activities.length - 1}
                />
              );
            })}
          </ul>
        ) : (
          <p className="p-12 text-center text-sm">No activity found</p>
        )}
      </ContentBlock>
    </>
  );
}

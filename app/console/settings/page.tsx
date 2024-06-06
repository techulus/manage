import { ContentBlock } from "@/components/core/content-block";
import PageTitle from "@/components/layout/page-title";
import { blob } from "@/drizzle/schema";
import { bytesToMegabytes } from "@/lib/blobStore";
import { database } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { clerkClient } from "@clerk/nextjs";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function Settings() {
  const { ownerId, userId } = getOwner();
  const user = await clerkClient.users.getUser(userId ?? "");

  const storage = await database()
    .select({
      count: sql<number>`count(*)`,
      usage: sql<number>`sum(${blob.contentSize})`,
    })
    .from(blob)
    .where(eq(blob.organizationId, ownerId))
    .get();

  return (
    <>
      <PageTitle title="Settings" />

      <ContentBlock>
        <main className="px-4 py-8 sm:px-6 lg:flex-auto">
          <div className="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
            <div>
              <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-200">
                Storage
              </h2>

              <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6 dark:divide-gray-800 dark:border-gray-800">
                <div className="pt-6 sm:flex">
                  <dt className="font-medium text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
                    Usage
                  </dt>
                  <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                    <div className="text-gray-900 dark:text-gray-200">
                      {bytesToMegabytes(storage?.usage ?? 0)} MB{" "}
                      <p className="inline font-bold">/ 5 GB</p> (
                      {storage?.count} files)
                    </div>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          <div className="mx-auto mt-16 max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
            <div>
              <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-200">
                Profile
              </h2>

              <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6 dark:divide-gray-800 dark:border-gray-800">
                <div className="pt-6 sm:flex">
                  <dt className="font-medium text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
                    Full name
                  </dt>
                  <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                    <div className="text-gray-900 dark:text-gray-200">
                      {user?.firstName} {user?.lastName}
                    </div>
                  </dd>
                </div>

                {user?.emailAddresses?.length ? (
                  <div className="pt-6 sm:flex">
                    <dt className="font-medium text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
                      Email address
                    </dt>
                    <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                      <div className="text-gray-900 dark:text-gray-200">
                        {user?.emailAddresses[0].emailAddress}
                      </div>
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </div>
        </main>
      </ContentBlock>
    </>
  );
}

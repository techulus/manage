import { auth } from "@/auth";
import { RegisterPasskeyButton } from "@/components/core/passkey";
import PageSection from "@/components/core/section";
import PageTitle from "@/components/layout/page-title";
import { Badge } from "@/components/ui/badge";
import { blob } from "@/drizzle/schema";
import { bytesToMegabytes } from "@/lib/blobStore";
import { database } from "@/lib/utils/useDatabase";
import { opsDb } from "@/ops/database";
import { authenticators } from "@/ops/schema";
import { eq, sql } from "drizzle-orm";
import { HardDrive, User2 } from "lucide-react";
import { notFound } from "next/navigation";

export default async function Settings() {
  const session = await auth();
  const user = session?.user;

  if (!user?.id) {
    return notFound();
  }

  const passkey = await opsDb().query.authenticators.findFirst({
    where: eq(authenticators.userId, user?.id),
  });

  const db = await database();
  const storage = await db
    .select({
      count: sql<number>`count(*)`,
      usage: sql<number>`sum(${blob.contentSize})`,
    })
    .from(blob)
    .get();

  return (
    <>
      <PageTitle title="Settings" />

      <PageSection topInset bottomMargin className="p-4">
        <h2 className="flex items-center text-xl font-semibold leading-7 text-gray-900 dark:text-gray-200">
          <HardDrive className="mr-2 inline-block h-6 w-6" />
          Storage
        </h2>

        <dl className="mt-6 space-y-6 divide-y divide-gray-100 text-sm leading-6 dark:divide-gray-800">
          <div className="pt-6 sm:flex">
            <dt className="font-semibold text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
              Usage
            </dt>
            <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <div className="text-gray-900 dark:text-gray-200">
                {bytesToMegabytes(storage?.usage ?? 0)} MB{" "}
                <p className="inline font-bold">/ 5 GB</p> ({storage?.count}{" "}
                files)
              </div>
            </dd>
          </div>
        </dl>
      </PageSection>

      <PageSection className="p-4">
        <h2 className="flex items-center text-xl font-semibold leading-7 text-gray-900 dark:text-gray-200">
          <User2 className="mr-2 inline-block h-6 w-6" />
          Profile
        </h2>

        <dl className="mt-6 space-y-6 divide-y divide-gray-100  text-sm leading-6 dark:divide-gray-800">
          <div className="pt-6 sm:flex">
            <dt className="font-semibold text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
              Passkey
            </dt>
            <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <div className="space-y-2 text-gray-900 dark:text-gray-200">
                <p>
                  Passkeys are a replacement for passwords that are more secure,
                  easier to use, and can&apos;t be phished.
                </p>
                {passkey ? (
                  <Badge variant="default">Registered</Badge>
                ) : (
                  <RegisterPasskeyButton />
                )}
              </div>
            </dd>
          </div>

          {user?.email ? (
            <div className="pt-6 sm:flex">
              <dt className="font-semibold text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
                Email address
              </dt>
              <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                <div className="text-gray-900 dark:text-gray-200">
                  {user.email}
                </div>
              </dd>
            </div>
          ) : null}
        </dl>
      </PageSection>
    </>
  );
}

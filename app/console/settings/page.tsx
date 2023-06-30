import { ContentBlock } from "@/components/core/content-block";
import { UpdateProfileButton } from "@/components/form/button";
import PageTitle from "@/components/layout/page-title";
import { auth, clerkClient } from "@clerk/nextjs/app-beta";
import { ThemePicker } from "@/components/core/theme-picker";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function Settings() {
  const theme = cookies().get("theme")?.value ?? "light";

  const { userId } = auth();
  const user = await clerkClient.users.getUser(userId ?? "");

  return (
    <>
      <PageTitle title="Settings" />

      <ContentBlock>
        <main className="px-4 py-8 sm:px-6 lg:flex-auto">
          <div className="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
            <div>
              <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-200">
                General
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                Manage your account settings.
              </p>

              <dl className="mt-6 space-y-6 divide-y divide-gray-100 dark:divide-gray-800 border-t border-gray-200 dark:border-gray-800 text-sm leading-6">
                <div className="pt-6 sm:flex">
                  <dt className="font-medium text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
                    Theme
                  </dt>
                  <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                    <ThemePicker currentTheme={theme} />
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-16 mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
            <div>
              <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-200">
                Profile
              </h2>

              <dl className="mt-6 space-y-6 divide-y divide-gray-100 dark:divide-gray-800 border-t border-gray-200 dark:border-gray-800 text-sm leading-6">
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

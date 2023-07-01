import { ContentBlock } from "@/components/core/content-block";
import PageTitle from "@/components/layout/page-title";
import { ProjecItem } from "@/components/project/item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getOwner } from "@/lib/utils/useOwner";
import { LIMIT, getProjectsForOwner } from "@/lib/utils/useProjects";
import Link from "next/link";

interface Props {
  searchParams: {
    search: string;
    page: string;
  };
}

export const dynamic = "force-dynamic";

export default async function Projects({ searchParams }: Props) {
  const ownerId = getOwner();

  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1;

  const { projects, count } = await getProjectsForOwner({
    ownerId,
    search: searchParams.search,
    page: currentPage,
  });

  return (
    <>
      <PageTitle
        title={
          searchParams.search ? `Search '${searchParams.search}'` : "Projects"
        }
        backUrl={searchParams.search ? "/console/projects" : undefined}
        actionLabel="New Project"
        actionLink="/console/projects/new"
      />

      {projects.length ? (
        <form
          action="/console/projects"
          className="flex flex-1 justify-center lg:justify-end mx-4 py-4 xl:pt-4 xl:pb-0 xl:m-0"
        >
          <div className="w-full max-w-5xl mx-auto">
            <label htmlFor="search" className="sr-only">
              Search projects
            </label>
            <div className="relative text-gray-600 dark:text-gray-400 focus-within:text-gray-800 dark:focus-within:text-gray-200">
              <Input
                name="search"
                placeholder="Search projects"
                type="search"
              />
            </div>
          </div>
        </form>
      ) : null}

      <ContentBlock>
        <ul
          role="list"
          className="divide-y divide-gray-200 dark:divide-gray-800 border-gray-200 dark:border-gray-800"
        >
          {projects.length === 0 ? (
            <div className="p-6">
              <Link
                href="/console/projects/new"
                className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center hover:border-gray-400 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6"
                  />
                </svg>
                {searchParams.search ? (
                  <span className="mt-4 block text-sm font-semibold text-gray-900 dark:text-gray-300">
                    We couldn&apos;t find any projects matching{" "}
                    {`"${searchParams.search}"`}
                  </span>
                ) : null}
                <span className="mt-2 block text-sm font-semibold text-gray-900 dark:text-gray-300">
                  Create new project
                </span>
              </Link>
            </div>
          ) : null}

          <div className="divide-y divide-gray-200 dark:divide-gray-800 overflow-hidden rounded-sm bg-gray-200 dark:bg-gray-900 shadow sm:grid sm:grid-cols-2 sm:gap-px sm:divide-y-0">
            {projects.map((project) => (
              <ProjecItem key={project.id} {...project} />
            ))}
          </div>
        </ul>

        {projects.length > 0 && !searchParams.search ? (
          <nav className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 px-4 py-3 sm:px-6">
            <div className="hidden sm:block">
              <p className="text-sm text-gray-700 dark:text-gray-400">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * LIMIT + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * LIMIT, count)}
                </span>{" "}
                of <span className="font-medium">{count}</span> projects
              </p>
            </div>

            <div className="flex flex-1 justify-between sm:justify-end">
              {currentPage > 1 ? (
                <form action="/console/projects">
                  <input type="hidden" name="page" value={currentPage - 1} />
                  <Button type="submit" variant="ghost">
                    Previous
                  </Button>
                </form>
              ) : null}

              {(currentPage - 1) * LIMIT + projects.length < count ? (
                <form action="/console/projects">
                  <input type="hidden" name="page" value={currentPage + 1} />
                  <Button type="submit" variant="ghost">
                    Next
                  </Button>
                </form>
              ) : null}
            </div>
          </nav>
        ) : null}
      </ContentBlock>
    </>
  );
}

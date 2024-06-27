import { ContentBlock } from "@/components/core/content-block";
import EmptyState from "@/components/core/empty-state";
import PageTitle from "@/components/layout/page-title";
import { ProjecItem } from "@/components/project/project-item";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProjectsForOwner } from "@/lib/utils/useProjects";
import Link from "next/link";

interface Props {
  searchParams: {
    search: string;
    status?: string;
  };
}

export const dynamic = "force-dynamic";

export default async function Projects({ searchParams }: Props) {
  const statuses = searchParams?.status?.split(",") ?? ["active"];

  const { projects, archivedProjects } = await getProjectsForOwner({
    search: searchParams.search,
    statuses,
  });

  return (
    <>
      <PageTitle
        title={
          searchParams.search ? `Search '${searchParams.search}'` : "Projects"
        }
        backUrl={searchParams.search ? "/console/projects" : undefined}
        actionLabel="New"
        actionLink="/console/projects/new"
      />

      {projects.length ? (
        <form
          action="/console/projects"
          className="mx-4 flex flex-1 justify-center py-4 lg:justify-end xl:m-0 xl:pb-0 xl:pt-4"
        >
          <div className="mx-auto w-full max-w-7xl">
            <label htmlFor="search" className="sr-only">
              Search projects
            </label>
            <div className="relative text-gray-600 focus-within:text-gray-800 dark:text-gray-400 dark:focus-within:text-gray-200">
              <Input
                name="search"
                placeholder="Search projects"
                type="search"
              />
            </div>
          </div>
        </form>
      ) : null}

      <ContentBlock className="border-none bg-transparent shadow-none">
        <EmptyState
          show={!projects.length}
          isSearchResult={!!searchParams?.search}
          label="projects"
          createLink="/console/projects/new"
        />

        <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:px-0">
          {projects.map((project) => (
            <ProjecItem key={project.id} project={project} />
          ))}
        </div>
      </ContentBlock>

      {archivedProjects.length > 0 && (
        <div className="mx-auto mt-12 flex w-full max-w-7xl flex-grow items-center border-t border-muted py-4">
          <p className="text-sm text-muted-foreground">
            {archivedProjects.length} archived project(s)
          </p>
          {statuses.includes("archived") ? (
            <Link
              href={`/console/projects/projects`}
              className={buttonVariants({ variant: "link" })}
            >
              Hide
            </Link>
          ) : (
            <Link
              href={`/console/projects?status=active,archived`}
              className={buttonVariants({ variant: "link" })}
            >
              Show
            </Link>
          )}
        </div>
      )}
    </>
  );
}

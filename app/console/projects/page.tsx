import { ContentBlock } from "@/components/core/content-block";
import EmptyState from "@/components/core/empty-state";
import PageTitle from "@/components/layout/page-title";
import { ProjecItem } from "@/components/project/project-item";
import { Input } from "@/components/ui/input";
import { ProjectWithUser } from "@/drizzle/types";
import { getProjectsForOwner } from "@/lib/utils/useProjects";

interface Props {
  searchParams: {
    search: string;
    page: string;
  };
}

export const dynamic = "force-dynamic";

export default async function Projects({ searchParams }: Props) {
  const { projects } = await getProjectsForOwner({
    search: searchParams.search,
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
          className="mx-4 flex flex-1 justify-center py-4 lg:justify-end xl:m-0 xl:pb-0 xl:pt-4"
        >
          <div className="mx-auto w-full max-w-5xl">
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

      <ContentBlock>
        <ul
          role="list"
          className="divide-y divide-gray-200 border-gray-200 dark:divide-gray-800 dark:border-gray-800"
        >
          <EmptyState
            show={!projects.length}
            isSearchResult={!!searchParams?.search}
            label="projects"
            createLink="/console/projects/new"
          />

          <div className="divide-y divide-gray-200 overflow-hidden rounded-sm bg-gray-200 shadow dark:divide-gray-800 dark:bg-gray-900 sm:grid sm:grid-cols-2 sm:gap-px sm:divide-y-0">
            {projects.map((project: ProjectWithUser) => (
              <ProjecItem key={project.id} project={project} />
            ))}
          </div>
        </ul>
      </ContentBlock>
    </>
  );
}

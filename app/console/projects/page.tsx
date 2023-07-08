import { ContentBlock } from "@/components/core/content-block";
import EmptyState from "@/components/core/empty-state";
import PageTitle from "@/components/layout/page-title";
import { ProjecItem } from "@/components/project/item";
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
          <EmptyState
            show={!projects.length}
            isSearchResult={!!searchParams?.search}
            label="projects"
          />

          <div className="divide-y divide-gray-200 dark:divide-gray-800 overflow-hidden rounded-sm bg-gray-200 dark:bg-gray-900 shadow sm:grid sm:grid-cols-2 sm:gap-px sm:divide-y-0">
            {projects.map((project: ProjectWithUser) => (
              <ProjecItem key={project.id} project={project} />
            ))}
          </div>
        </ul>
      </ContentBlock>
    </>
  );
}

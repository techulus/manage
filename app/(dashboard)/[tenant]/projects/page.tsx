import EmptyState from "@/components/core/empty-state";
import PageSection from "@/components/core/section";
import PageTitle from "@/components/layout/page-title";
import { ProjecItem } from "@/components/project/project-item";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getOwner, getTimezone } from "@/lib/utils/useOwner";
import { caller } from "@/trpc/server";
import Link from "next/link";

interface Props {
	searchParams: Promise<{
		search: string;
		status?: string;
	}>;
}

export default async function Projects(props: Props) {
	const searchParams = await props.searchParams;
	const { orgSlug } = await getOwner();
	const statuses = searchParams?.status?.split(",") ?? ["active"];
	const timezone = await getTimezone();

	const projects = await caller.user.getProjects({
		statuses,
		search: searchParams.search,
	});

	return (
		<>
			<PageTitle
				title={
					searchParams.search ? `Search '${searchParams.search}'` : "Projects"
				}
				actionLabel="New"
				actionLink={`/${orgSlug}/projects/new`}
			/>

			{projects.length ? (
				<PageSection topInset bottomMargin>
					<form action={`/${orgSlug}/projects`}>
						<div className="mx-auto w-full max-w-7xl">
							<label htmlFor="search" className="sr-only">
								Search projects
							</label>
							<div className="relative text-gray-600 focus-within:text-gray-800 dark:text-gray-400 dark:focus-within:text-gray-200">
								<Input
									name="search"
									placeholder="Search projects"
									type="search"
									className="h-12"
								/>
							</div>
						</div>
					</form>
				</PageSection>
			) : null}

			<div className="mx-auto mt-8 flex max-w-7xl flex-col">
				<EmptyState
					show={!projects.length}
					isSearchResult={!!searchParams?.search}
					label="projects"
					createLink={`/${orgSlug}/projects/new`}
				/>

				<div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:px-0">
					{projects.map((project) => (
						<ProjecItem
							key={project.id}
							project={project}
							timezone={timezone}
						/>
					))}
				</div>
			</div>

			<div className="mx-auto mt-12 flex w-full max-w-7xl flex-grow items-center border-t border-muted p-4 md:py-4">
				{statuses.includes("archived") ? (
					<Link
						href={`/${orgSlug}/projects`}
						className={buttonVariants({ variant: "link" })}
						prefetch={false}
					>
						Hide Archived
					</Link>
				) : (
					<Link
						href={`/${orgSlug}/projects?status=active,archived`}
						className={buttonVariants({ variant: "link" })}
						prefetch={false}
					>
						Show Archived
					</Link>
				)}
			</div>
		</>
	);
}

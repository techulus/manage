"use client";

import EmptyState from "@/components/core/empty-state";
import PageSection from "@/components/core/section";
import PageTitle from "@/components/layout/page-title";
import { ProjecItem } from "@/components/project/project-item";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQueries } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { Suspense } from "react";
import PageLoading from "../loading";

export default function Projects() {
	const params = useParams();
	const [search, setSearch] = useQueryState("search");
	const [statuses] = useQueryState("status", {
		defaultValue: "active",
	});
	const trpc = useTRPC();
	const orgSlug = params.tenant as string;

	const [{ data: timezone }, { data: projects = [] }] = useSuspenseQueries({
		queries: [
			trpc.settings.getTimezone.queryOptions(),
			trpc.user.getProjects.queryOptions({
				statuses: statuses.split(","),
				search: search ?? undefined,
			}),
		],
	});

	const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const searchValue = formData.get("search") as string;
		setSearch(searchValue);
	};

	return (
		<Suspense fallback={<PageLoading />}>
			<PageTitle
				title={search ? `Search '${search}'` : "Projects"}
				actionLabel="New"
				actionLink={`/${orgSlug}/projects/new`}
			/>

			<PageSection topInset bottomMargin>
				<form onSubmit={handleSearch}>
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
								defaultValue={search ?? ""}
							/>
						</div>
					</div>
				</form>
			</PageSection>

			<div className="mx-auto mt-8 flex max-w-7xl flex-col">
				<EmptyState
					show={!projects.length}
					isSearchResult={!!search}
					label="projects"
					createLink={`/${orgSlug}/projects/new`}
				/>

				<div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:px-0">
					{projects.map((project) => (
						<ProjecItem
							key={project.id}
							project={project}
							timezone={timezone || ""}
						/>
					))}
				</div>
			</div>

			<div className="mx-auto mt-12 flex w-full max-w-7xl flex-grow items-center border-t border-muted">
				{statuses.includes("archived") ? (
					<Link
						href={`/${orgSlug}/projects`}
						className={buttonVariants({ variant: "link" })}
					>
						Hide Archived
					</Link>
				) : (
					<Link
						href={`/${orgSlug}/projects?status=active,archived`}
						className={buttonVariants({ variant: "link" })}
					>
						Show Archived
					</Link>
				)}
			</div>
		</Suspense>
	);
}

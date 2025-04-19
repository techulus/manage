"use client";

import EmptyState from "@/components/core/empty-state";
import { Greeting } from "@/components/core/greeting";
import { PageLoading } from "@/components/core/loaders";
import PageSection from "@/components/core/section";
import PageTitle from "@/components/layout/page-title";
import { ProjecItem } from "@/components/project/project-item";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toDateStringWithDay, toDateTimeString } from "@/lib/utils/date";
import { eventToHumanReadableString } from "@/lib/utils/useEvents";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQueries } from "@tanstack/react-query";
import {
	AlertTriangleIcon,
	CalendarClockIcon,
	FolderIcon,
	InfoIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { Suspense } from "react";
import { rrulestr } from "rrule";

export default function Today() {
	const params = useParams();
	const tenant = params.tenant as string;

	const trpc = useTRPC();
	const [statuses] = useQueryState("status", {
		defaultValue: "active",
	});

	const [
		{
			data: { dueToday, overDue, events },
		},
		{ data: projects },
		{ data: timezone },
	] = useSuspenseQueries({
		queries: [
			{
				...trpc.user.getTodayData.queryOptions(),
				staleTime: 0,
			},
			trpc.user.getProjects.queryOptions({
				statuses: statuses.split(","),
			}),
			trpc.settings.getTimezone.queryOptions(),
		],
	});

	return (
		<Suspense fallback={<PageLoading />}>
			<PageTitle title={toDateStringWithDay(new Date(), timezone)} />

			<div className="max-w-7xl mx-4 xl:mx-auto -mt-4 pb-4">
				<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
					<Card className="col-span-2 md:col-span-1 p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-none">
						<h2 className="text-2xl font-semibold">
							<Greeting timezone={timezone} />
						</h2>
					</Card>
					<Card className="p-2 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-none">
						<div className="flex flex-col items-center justify-center h-full">
							<span className="text-4xl font-bold text-orange-500">
								{dueToday.length}
							</span>
							<span className="text-muted-foreground mt-1">Due Today</span>
						</div>
					</Card>
					<Card className="p-2 bg-gradient-to-br from-red-500/10 to-red-500/5 border-none">
						<div className="flex flex-col items-center justify-center h-full">
							<span className="text-4xl font-bold text-red-500">
								{overDue.length}
							</span>
							<span className="text-muted-foreground mt-1">Overdue</span>
						</div>
					</Card>
				</div>
			</div>

			{events.length ? (
				<PageSection
					title="Events"
					titleIcon={<CalendarClockIcon className="w-5 h-5" />}
				>
					{events.map((event) => (
						<Link
							href={`/${tenant}/projects/${event.project.id}/events`}
							key={event.id}
							className="px-4 py-2 hover:bg-muted/50 transition-colors border-none"
						>
							<div className="flex flex-col">
								<div className="text-lg font-semibold">{event.name}</div>
								<div
									className="pb-1 text-xs text-gray-500 dark:text-gray-400"
									suppressHydrationWarning
								>
									{eventToHumanReadableString(event, timezone)}
								</div>
								<div className="text-xs text-primary mt-2">
									{event.project.name}
								</div>
							</div>
						</Link>
					))}
				</PageSection>
			) : null}

			{overDue.length ? (
				<PageSection
					title="Overdue"
					titleClassName="text-red-600 dark:text-red-500"
					titleIcon={<AlertTriangleIcon className="w-5 h-5" />}
				>
					{overDue.map((task) => TaskItem(tenant, task))}
				</PageSection>
			) : null}

			{dueToday.length ? (
				<PageSection
					title="Due Today"
					titleClassName="text-orange-600 dark:text-orange-500"
					titleIcon={<InfoIcon className="w-5 h-5" />}
				>
					{dueToday.map((task) => TaskItem(tenant, task))}
				</PageSection>
			) : null}

			<PageSection
				title="Projects"
				titleIcon={<FolderIcon className="w-5 h-5" />}
				transparent
			>
				{projects?.length ? (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{projects.map((project) => (
							<ProjecItem
								key={project.id}
								project={project}
								timezone={timezone || ""}
							/>
						))}
					</div>
				) : (
					<EmptyState
						show={!projects.length}
						label="projects"
						createLink={`/${tenant}/projects/new`}
					/>
				)}

				<div className="mx-auto mt-6 flex w-full max-w-7xl flex-grow items-center border-t border-muted">
					{statuses.includes("archived") ? (
						<Link
							href={`/${tenant}/today`}
							className={buttonVariants({ variant: "link" })}
						>
							Hide Archived
						</Link>
					) : (
						<Link
							href={`/${tenant}/today?status=active,archived`}
							className={buttonVariants({ variant: "link" })}
						>
							Show Archived
						</Link>
					)}
				</div>
			</PageSection>
		</Suspense>
	);
}

function TaskItem(
	tenant: string,
	task: {
		name: string;
		id: number;
		taskList: {
			id: number;
			name: string;
			status: string;
			project: { id: number; name: string };
		};
	},
) {
	return (
		<Link
			href={`/${tenant}/projects/${task.taskList.project.id}/tasklists/${task.taskList.id}`}
			key={task.id}
		>
			<div className="px-4 py-2 hover:bg-muted/50 transition-colors border-none">
				<div className="flex items-start justify-between">
					<div className="space-y-1">
						<h4 className="font-medium">{task.name}</h4>
						<div className="text-sm text-muted-foreground">
							<span className="text-primary">{task.taskList.project.name}</span>{" "}
							• {task.taskList.name}
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
}

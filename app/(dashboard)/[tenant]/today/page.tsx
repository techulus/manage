"use client";

import { Title } from "@radix-ui/react-dialog";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import {
	AlertTriangleIcon,
	CalendarClockIcon,
	FolderIcon,
	InfoIcon,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useState } from "react";
import { Greeting } from "@/components/core/greeting";
import { PageLoading } from "@/components/core/loaders";
import { Panel } from "@/components/core/panel";
import PageSection from "@/components/core/section";
import { SaveButton } from "@/components/form/button";
import SharedForm from "@/components/form/shared";
import PageTitle from "@/components/layout/page-title";
import { ProjecItem } from "@/components/project/project-item";
import { TaskItem } from "@/components/today/task-item";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toDateStringWithDay } from "@/lib/utils/date";
import { displayMutationError } from "@/lib/utils/error";
import { eventToHumanReadableString } from "@/lib/utils/useEvents";
import { isPersonalTenant } from "@/lib/utils/tenant";
import { useTRPC } from "@/trpc/client";

export default function Today() {
	const params = useParams();
	const tenant = params.tenant as string;

	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [statuses] = useQueryState(
		"status",
		parseAsString.withDefault("active"),
	);

	const [{ data: todayData }, { data: projectsData }, { data: timezone }] =
		useQueries({
			queries: [
				trpc.user.getTodayData.queryOptions(),
				trpc.user.getProjects.queryOptions({
					statuses: statuses.split(","),
				}),
				trpc.settings.getTimezone.queryOptions(),
			],
		});

	const projects = projectsData?.projects;
	const isOrgAdmin = projectsData?.isOrgAdmin ?? isPersonalTenant(tenant);

	const { dueToday = [], overDue = [], events = [] } = todayData ?? {};

	const createProject = useMutation(
		trpc.projects.createProject.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.user.getProjects.queryKey({
						statuses: ["active"],
					}),
				});

				setCreate(false);
			},
			onError: displayMutationError,
		}),
	);

	const [create, setCreate] = useState(false);

	if (!timezone) return <PageLoading />;

	return (
		<>
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
							className="px-4 py-2 hover:bg-muted/50 transition-colors"
						>
							<div className="flex flex-col">
								<h4 className="font-medium">{event.name}</h4>
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
					{overDue.map((task) => (
						<TaskItem key={task.id} tenant={tenant} task={task} />
					))}
				</PageSection>
			) : null}

			{dueToday.length ? (
				<PageSection
					title="Due Today"
					titleClassName="text-orange-600 dark:text-orange-500"
					titleIcon={<InfoIcon className="w-5 h-5" />}
				>
					{dueToday.map((task) => (
						<TaskItem key={task.id} tenant={tenant} task={task} />
					))}
				</PageSection>
			) : null}

			<PageSection
				title="Projects"
				titleIcon={<FolderIcon className="w-5 h-5" />}
				titleAction={
					isOrgAdmin ? (
						<Button size="sm" onClick={() => setCreate(true)}>
							New
						</Button>
					) : null
				}
				transparent
			>
				{projects?.length ? (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{projects.map((project) => (
							<ProjecItem
								key={project.id}
								project={project}
								userRole={project.userRole}
								timezone={timezone || ""}
							/>
						))}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center py-8 border border-muted rounded-lg">
						{isOrgAdmin ? (
							<>
								<FolderIcon className="h-12 w-12 text-muted-foreground/50" />
								<p className="mt-4 text-sm text-muted-foreground">
									No projects yet
								</p>
								<Button className="mt-4" onClick={() => setCreate(true)}>
									Create new project
								</Button>
							</>
						) : (
							<>
								<Users className="h-12 w-12 text-muted-foreground/50" />
								<p className="mt-4 text-sm text-muted-foreground font-medium">
									No project access
								</p>
								<p className="mt-2 text-xs text-muted-foreground text-center">
									Ask your organization admin to grant you access to projects
								</p>
							</>
						)}
					</div>
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

			<Panel open={create} setOpen={setCreate}>
				<Title>
					<PageTitle title="Create Project" compact />
				</Title>

				<form
					action={async (formData) => {
						await createProject.mutateAsync({
							name: formData.get("name") as string,
							description: formData.get("description") as string,
							dueDate: formData.get("dueDate")
								? new Date(formData.get("dueDate") as string)
								: undefined,
						});
					}}
					className="px-6"
				>
					<SharedForm />

					<div className="mt-6 flex items-center justify-end gap-x-6">
						<Button
							type="button"
							variant="outline"
							onClick={() => setCreate(false)}
						>
							Cancel
						</Button>
						<SaveButton />
					</div>
				</form>
			</Panel>
		</>
	);
}

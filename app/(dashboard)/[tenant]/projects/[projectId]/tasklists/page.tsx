"use client";

import EmptyState from "@/components/core/empty-state";
import { Panel } from "@/components/core/panel";
import PageSection from "@/components/core/section";
import { SaveButton } from "@/components/form/button";
import SharedForm from "@/components/form/shared";
import PageTitle from "@/components/layout/page-title";
import { TaskListItem } from "@/components/project/tasklist/tasklist";
import { Button, buttonVariants } from "@/components/ui/button";
import { useTaskLists } from "@/hooks/use-tasklist";
import { TasksProvider } from "@/hooks/use-tasks";
import { useTRPC } from "@/trpc/client";
import { Title } from "@radix-ui/react-dialog";
import { useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { parseAsBoolean, useQueryState } from "nuqs";

export default function TaskLists() {
	const { projectId, tenant } = useParams();
	const [statuses] = useQueryState("status", {
		defaultValue: "active",
	});

	const [create, setCreate] = useQueryState(
		"create",
		parseAsBoolean.withDefault(false),
	);

	const trpc = useTRPC();
	const { data: taskLists } = useSuspenseQuery(
		trpc.tasks.getTaskLists.queryOptions({
			projectId: +projectId!,
			statuses: statuses.split(",") ?? ["active"],
		}),
	);

	const { createTaskList } = useTaskLists();

	return (
		<>
			<PageTitle
				title="Tasks"
				actions={
					<Link
						href={`/${tenant}/projects/${projectId}/tasklists?create=true`}
						className={buttonVariants()}
					>
						New
					</Link>
				}
			/>

			<PageSection transparent>
				<EmptyState
					show={!taskLists.length}
					label="list"
					createLink={`/${tenant}/projects/${projectId}/tasklists?create=true`}
				/>

				{taskLists?.length ? (
					<ul className="grid grid-cols-1 gap-x-4 gap-y-4 lg:grid-cols-2">
						{taskLists.map((taskList) => (
							<TasksProvider
								key={taskList.id}
								projectId={+projectId!}
								taskListId={taskList.id}
							>
								<TaskListItem id={taskList.id} compact />
							</TasksProvider>
						))}
					</ul>
				) : null}

				<div className="mx-auto flex w-full max-w-7xl flex-grow items-center">
					{statuses.includes("archived") ? (
						<Link
							href={`/${tenant}/projects/${projectId}/tasklists`}
							className={buttonVariants({ variant: "link" })}
						>
							Hide Archived
						</Link>
					) : (
						<Link
							href={`/${tenant}/projects/${projectId}/tasklists?status=active,archived`}
							className={buttonVariants({ variant: "link" })}
						>
							Show Archived
						</Link>
					)}
				</div>
			</PageSection>

			<Panel open={create} setOpen={setCreate}>
				<Title>
					<PageTitle title="Create List" compact />
				</Title>
				<form
					action={async (formData) => {
						const name = formData.get("name") as string;
						const description = formData.get("description") as string;
						const dueDate = formData.get("dueDate") as string;

						await createTaskList.mutateAsync({
							projectId: +projectId!,
							name,
							description,
							dueDate,
						});

						setCreate(false);
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

"use client";

import EmptyState from "@/components/core/empty-state";
import { Panel } from "@/components/core/panel";
import { SaveButton } from "@/components/form/button";
import SharedForm from "@/components/form/shared";
import PageTitle from "@/components/layout/page-title";
import { TaskListItem } from "@/components/project/tasklist/tasklist";
import { Button, buttonVariants } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { Title } from "@radix-ui/react-dialog";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
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

	const queryClient = useQueryClient();
	const upsertTaskList = useMutation(
		trpc.tasks.upsertTaskList.mutationOptions(),
	);

	return (
		<>
			<PageTitle
				title="Task Lists"
				actionLabel="New"
				actionLink={`/${tenant}/projects/${projectId}/tasklists?create=true`}
			/>

			<div className="mx-4 sm:mx-auto max-w-7xl">
				<EmptyState
					show={!taskLists.length}
					label="task list"
					createLink={`/${tenant}/projects/${projectId}/tasklists/new`}
				/>

				<ul className="grid grid-cols-1 gap-x-4 gap-y-4 lg:grid-cols-2">
					{taskLists.map((taskList) => (
						<TaskListItem key={taskList.id} id={taskList.id} compact />
					))}
				</ul>

				<div className="mx-auto mt-12 flex w-full max-w-7xl flex-grow items-center border-t border-muted">
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
			</div>

			<Panel open={create} setOpen={setCreate}>
				<Title>
					<PageTitle title="Create Task List" compact />
				</Title>
				<form
					action={async (formData) => {
						const name = formData.get("name") as string;
						const description = formData.get("description") as string;
						const dueDate = formData.get("dueDate") as string;
						const status = formData.get("status") as string;

						await upsertTaskList.mutateAsync({
							projectId: +projectId!,
							name,
							description,
							dueDate,
							status: status ?? "active",
						});

						queryClient.invalidateQueries({
							queryKey: trpc.tasks.getTaskLists.queryKey({
								projectId: +projectId!,
							}),
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

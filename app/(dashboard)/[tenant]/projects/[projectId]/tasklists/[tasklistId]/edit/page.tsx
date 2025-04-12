"use client";

import PageSection from "@/components/core/section";
import { SaveButton } from "@/components/form/button";
import SharedForm from "@/components/form/shared";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function EditTaskList() {
	const { tenant, projectId, tasklistId } = useParams();
	const router = useRouter();
	const queryClient = useQueryClient();
	const trpc = useTRPC();

	const { data: tasklist } = useQuery(
		trpc.tasks.getListById.queryOptions({ id: +tasklistId! }),
	);

	const upsertTaskList = useMutation(
		trpc.tasks.upsertTaskList.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.tasks.getListById.queryKey({ id: +tasklistId! }),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.tasks.getTaskLists.queryKey({
						projectId: +projectId!,
					}),
				});
			},
		}),
	);

	const backUrl = `/${tenant}/projects/${projectId}/tasklists`;

	return (
		<>
			<PageTitle title="Update Task list" />

			<PageSection>
				<form
					action={async (formData) => {
						const name = formData.get("name") as string;
						const description = formData.get("description") as string;
						const dueDate = formData.get("dueDate") as string;
						const status = formData.get("status") as string;

						await upsertTaskList.mutateAsync({
							id: +tasklistId!,
							projectId: +projectId!,
							name,
							description,
							dueDate,
							status: status ?? "active",
						});

						router.push(
							`/${tenant}/projects/${projectId}/tasklists/${tasklistId}`,
						);
					}}
				>
					<input type="hidden" name="id" defaultValue={tasklistId} />
					<input type="hidden" name="projectId" defaultValue={projectId} />
					<CardContent>
						<SharedForm item={tasklist} />
					</CardContent>
					<CardFooter>
						<div className="ml-auto flex items-center justify-end gap-x-6">
							<Link
								href={backUrl}
								className={buttonVariants({ variant: "ghost" })}
							>
								Cancel
							</Link>
							<SaveButton />
						</div>
					</CardFooter>
				</form>
			</PageSection>
		</>
	);
}

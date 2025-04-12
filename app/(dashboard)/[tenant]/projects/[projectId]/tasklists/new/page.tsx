"use client";

import PageSection from "@/components/core/section";
import { SaveButton } from "@/components/form/button";
import SharedForm from "@/components/form/shared";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function CreateTaskList() {
	const { tenant, projectId } = useParams();

	const backUrl = `/${tenant}/projects/${projectId}/tasklists`;

	const router = useRouter();
	const queryClient = useQueryClient();
	const trpc = useTRPC();
	const upsertTaskList = useMutation(
		trpc.tasks.upsertTaskList.mutationOptions(),
	);

	return (
		<>
			<PageTitle title="Create task list" />

			<PageSection>
				<form
					action={async (formData) => {
						const name = formData.get("name") as string;
						const description = formData.get("description") as string;
						const dueDate = formData.get("dueDate") as string;
						const status = formData.get("status") as string;

						const list = await upsertTaskList.mutateAsync({
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

						router.push(
							`/${tenant}/projects/${projectId}/tasklists/${list?.[0].id}`,
						);
					}}
				>
					<CardContent>
						<SharedForm />
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

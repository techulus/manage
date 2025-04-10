"use client";

import PageSection from "@/components/core/section";
import { SaveButton } from "@/components/form/button";
import SharedForm from "@/components/form/shared";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import PageLoading from "../loading";

export default function EditProject() {
	const { tenant, projectId } = useParams();
	const router = useRouter();
	const queryClient = useQueryClient();
	const trpc = useTRPC();

	const { data: project } = useSuspenseQuery(
		trpc.projects.getProjectById.queryOptions({
			id: +projectId!,
		}),
	);

	const updateProject = useMutation(
		trpc.projects.upsertProject.mutationOptions(),
	);

	return (
		<Suspense fallback={<PageLoading />}>
			<PageTitle title={project.name} />

			<PageSection topInset>
				<form
					action={async (formData) => {
						await updateProject.mutateAsync({
							id: +projectId!,
							name: formData.get("name") as string,
							description: formData.get("description") as string,
							dueDate: formData.get("dueDate")
								? new Date(formData.get("dueDate") as string)
								: undefined,
						});
						await queryClient.invalidateQueries({
							queryKey: [
								trpc.projects.getProjectById.queryKey({
									id: +projectId!,
								}),
								trpc.user.getProjects.queryKey({
									statuses: ["active"],
								}),
							],
						});
						router.push(`/${tenant}/projects/${projectId}`);
					}}
				>
					<CardContent>
						<input type="hidden" name="id" defaultValue={projectId} />
						<SharedForm item={project} />
					</CardContent>
					<CardFooter>
						<div className="flex items-center justify-end gap-x-6">
							<Link
								href={`/${tenant}/projects`}
								className={buttonVariants({ variant: "ghost" })}
							>
								Cancel
							</Link>
							<SaveButton />
						</div>
					</CardFooter>
				</form>
			</PageSection>
		</Suspense>
	);
}

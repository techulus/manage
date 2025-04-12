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
import { useParams } from "next/navigation";

export default function CreateProject() {
	const { tenant } = useParams();
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const createProject = useMutation(
		trpc.projects.upsertProject.mutationOptions(),
	);

	return (
		<>
			<PageTitle title="Create Project" />
			<PageSection>
				<form
					action={async (formData) => {
						await createProject.mutateAsync({
							name: formData.get("name") as string,
							description: formData.get("description") as string,
							dueDate: formData.get("dueDate")
								? new Date(formData.get("dueDate") as string)
								: undefined,
						});
						queryClient.invalidateQueries({
							queryKey: trpc.user.getProjects.queryKey({
								statuses: ["active"],
							}),
						});
					}}
				>
					<CardContent>
						<SharedForm />
					</CardContent>
					<CardFooter>
						<div className="ml-auto flex items-center justify-end gap-x-6">
							<Link
								href={`/${tenant}/today`}
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

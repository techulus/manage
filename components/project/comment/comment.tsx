"use client";

import { Spinner } from "@/components/core/loaders";
import { UserAvatar } from "@/components/core/user-avatar";
import Editor from "@/components/editor";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export default function CommentForm({
	roomId,
}: {
	roomId: string;
}) {
	const { projectId } = useParams();
	const { user: creator } = useUser();

	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const addComment = useMutation(trpc.projects.addComment.mutationOptions());

	return (
		<form
			className="pb-12"
			action={async (formData: FormData) => {
				await addComment.mutateAsync({
					roomId,
					content: formData.get("content") as string,
					metadata: formData.get("metadata") as string,
					projectId: +projectId!,
				});
				await queryClient.invalidateQueries({
					queryKey: trpc.projects.getComments.queryKey({
						roomId,
					}),
				});
			}}
		>
			<div className="flex w-full flex-row space-x-4">
				<div className="hidden w-[160px] md:block" />

				{creator ? <UserAvatar user={creator} /> : null}

				<div className="relative flex-grow">
					<Editor name="content" />
					<Button
						size="sm"
						className="absolute -bottom-12 left-0"
						type="submit"
					>
						{addComment.isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
						Comment
					</Button>
				</div>
			</div>
		</form>
	);
}

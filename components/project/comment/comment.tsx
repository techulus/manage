"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { Spinner } from "@/components/core/loaders";
import { UserAvatar } from "@/components/core/user-avatar";
import Editor from "@/components/editor";
import { Button } from "@/components/ui/button";
import { displayMutationError } from "@/lib/utils/error";
import { useTRPC } from "@/trpc/client";

export default function CommentForm({ roomId }: { roomId: string }) {
	const { projectId } = useParams();
	const { user: creator } = useUser();
	const [content, setContent] = useState<string>("");
	const formRef = useRef<HTMLFormElement>(null);

	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const addComment = useMutation(
		trpc.projects.addComment.mutationOptions({
			onError: displayMutationError,
		}),
	);

	return (
		<form
			ref={formRef}
			className="pb-12"
			action={async (formData: FormData) => {
				await addComment.mutateAsync({
					roomId,
					content: formData.get("content") as string,
					metadata: formData.get("metadata") as string,
					projectId: +projectId!,
				});
				queryClient.invalidateQueries({
					queryKey: trpc.projects.getComments.queryKey({
						roomId,
					}),
				});
				setContent("");
				formRef.current?.reset();
			}}
		>
			<div className="flex w-full flex-row space-x-4">
				<div className="hidden min-w-[160px] md:block" />

				{creator ? <UserAvatar user={creator} /> : null}

				<div className="relative w-full">
					<Editor
						name="content"
						allowImageUpload
						onContentChange={setContent}
					/>
					<Button
						size="sm"
						className="absolute -bottom-12 left-0"
						type="submit"
						disabled={!content.trim() || addComment.isPending}
					>
						{addComment.isPending ? (
							<Spinner className="mr-2 h-4 w-4 text-muted" />
						) : null}
						Comment
					</Button>
				</div>
			</div>
		</form>
	);
}

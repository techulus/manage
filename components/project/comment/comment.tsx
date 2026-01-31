"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { Spinner } from "@/components/core/loaders";
import { UserAvatar } from "@/components/core/user-avatar";
import Editor from "@/components/editor";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth/client";
import { displayMutationError } from "@/lib/utils/error";
import { useTRPC } from "@/trpc/client";

interface CommentFormProps {
	roomId: string;
	parentCommentId?: number;
	onCancel?: () => void;
	onSuccess?: () => void;
	isReply?: boolean;
}

export default function CommentForm({
	roomId,
	parentCommentId,
	onCancel,
	onSuccess,
	isReply = false,
}: CommentFormProps) {
	const { projectId } = useParams();
	const { data: session } = useSession();
	const [content, setContent] = useState<string>("");
	const formRef = useRef<HTMLFormElement>(null);

	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const addComment = useMutation(
		trpc.projects.addComment.mutationOptions({
			onError: displayMutationError,
		}),
	);

	const submitRoomId = parentCommentId ? `comment-${parentCommentId}` : roomId;

	return (
		<form
			ref={formRef}
			className={isReply ? "mt-4 pl-4" : "pb-12"}
			action={async (formData: FormData) => {
				await addComment.mutateAsync({
					roomId: submitRoomId,
					content: formData.get("content") as string,
					metadata: formData.get("metadata") as string,
					projectId: +projectId!,
				});

				queryClient.invalidateQueries({
					queryKey: trpc.projects.getComments.queryKey({
						roomId,
						projectId: +projectId!,
					}),
				});

				if (parentCommentId) {
					queryClient.invalidateQueries({
						queryKey: trpc.projects.getComments.queryKey({
							roomId: `comment-${parentCommentId}`,
							projectId: +projectId!,
						}),
					});
				}

				setContent("");
				formRef.current?.reset();
				onSuccess?.();
				if (isReply) onCancel?.();
			}}
		>
			<div className="flex w-full flex-row space-x-4">
				{session?.user ? <UserAvatar user={session.user} /> : null}

				<div className="relative w-full">
					<Editor
						name="content"
						allowImageUpload
						onContentChange={setContent}
					/>
					{isReply ? (
						<div className="flex space-x-2 mt-2">
							<Button
								size="sm"
								type="submit"
								disabled={!content.trim() || addComment.isPending}
							>
								{addComment.isPending ? (
									<Spinner className="mr-2 h-4 w-4 text-muted" />
								) : null}
								Reply
							</Button>
							<Button
								size="sm"
								variant="ghost"
								type="button"
								onClick={onCancel}
							>
								Cancel
							</Button>
						</div>
					) : (
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
					)}
				</div>
			</div>
		</form>
	);
}

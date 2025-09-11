"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleEllipsisIcon, MessageSquareIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { HtmlPreview } from "@/components/core/html-view";
import { UserAvatar } from "@/components/core/user-avatar";
import { DeleteButton } from "@/components/form/button";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { displayMutationError } from "@/lib/utils/error";
import { useTRPC } from "@/trpc/client";
import type { RouterOutputs } from "@/trpc/routers/_app";
import CommentForm from "./comment";

type CommentWithReplies = RouterOutputs["projects"]["getComments"][number];

function CommentThread({
	comment,
	depth = 0,
	onDelete,
	roomId,
	projectId,
	onRefresh,
}: {
	comment: CommentWithReplies;
	depth?: number;
	onDelete: (id: number) => void;
	roomId: string;
	projectId: string;
	onRefresh: () => void;
}) {
	const { user } = useUser();
	const [showReplyForm, setShowReplyForm] = useState(false);
	const [showReplies, setShowReplies] = useState(false);

	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const [shouldLoadReplies, setShouldLoadReplies] = useState(false);

	const { data: replies = [], isLoading: repliesLoading } = useQuery({
		...trpc.projects.getComments.queryOptions({
			roomId: `comment-${comment.id}`,
		}),
		enabled: shouldLoadReplies,
	});

	const loadReplies = () => {
		if (!shouldLoadReplies) {
			setShouldLoadReplies(true);
			setShowReplies(true);
		}
	};

	const toggleReplies = () => {
		if (!showReplies) {
			loadReplies();
		} else {
			setShowReplies(false);
			// Reset loading state so replies can be loaded again
			setShouldLoadReplies(false);
		}
	};

	return (
		<div
			className={cn(
				"relative flex pb-2",
				depth > 0 && "ml-4 border-l-2 border-muted pl-2",
			)}
		>
			<div className="flex space-x-4 w-full">
				{comment.creator ? <UserAvatar user={comment.creator} /> : null}
				<div className="w-full">
					<div className="flex items-center space-x-2">
						<span className="text-primary text-sm font-semibold">
							{comment.creator?.firstName ?? "User"}
						</span>
						<span className="text-xs text-muted-foreground">
							{new Date(comment.createdAt).toLocaleString()}
						</span>
					</div>
					<HtmlPreview content={comment.content} />

					{/* Reply button */}
					<div className="flex items-center space-x-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setShowReplyForm(!showReplyForm)}
							className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
						>
							<MessageSquareIcon className="h-3 w-3 mr-1" />
							Reply
						</Button>
						{comment.replyCount > 0 && (
							<Button
								variant="ghost"
								size="sm"
								onClick={toggleReplies}
								disabled={repliesLoading}
								className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
							>
								{repliesLoading
									? "Loading..."
									: showReplies
										? "Hide replies"
										: `${comment.replyCount} ${comment.replyCount === 1 ? "reply" : "replies"}`}
							</Button>
						)}
					</div>

					{/* Reply form */}
					{showReplyForm && (
						<CommentForm
							roomId={roomId}
							parentCommentId={comment.id}
							isReply={true}
							onCancel={() => setShowReplyForm(false)}
							onSuccess={() => {
								setShowReplyForm(false);
								onRefresh();
								if (!shouldLoadReplies) {
									setShouldLoadReplies(true);
									setShowReplies(true);
								}
								queryClient.invalidateQueries({
									queryKey: trpc.projects.getComments.queryKey({
										roomId: `comment-${comment.id}`,
									}),
								});
							}}
						/>
					)}

					{comment.creator?.id === user?.id ? (
						<DropdownMenu>
							<DropdownMenuTrigger className="absolute right-2 top-[8px]">
								<CircleEllipsisIcon className="h-5 w-5" />
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem className="m-0 p-0">
									<form
										action={async () => {
											onDelete(comment.id);
										}}
										className="w-full"
									>
										<DeleteButton action="Delete" className="w-full" compact />
									</form>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : null}

					{/* Render nested replies */}
					{showReplies && replies.length > 0 && (
						<div className="mt-4">
							{replies.map((reply, _index) => (
								<div key={reply.id} className="relative">
									<CommentThread
										comment={reply}
										depth={depth + 1}
										onDelete={onDelete}
										roomId={roomId}
										projectId={projectId}
										onRefresh={onRefresh}
									/>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export function Comments({
	roomId,
	className,
}: {
	roomId: string;
	className?: string;
}) {
	const { projectId } = useParams();
	const queryClient = useQueryClient();

	const trpc = useTRPC();
	const { data: comments = [], refetch } = useQuery(
		trpc.projects.getComments.queryOptions({
			roomId,
		}),
	);

	const deleteComment = useMutation(
		trpc.projects.deleteComment.mutationOptions({
			onSuccess: () => {
				// Force refetch of current comments
				refetch();
				// Also invalidate all comments queries
				queryClient.invalidateQueries({
					queryKey: ["projects", "getComments"],
				});
			},
			onError: displayMutationError,
		}),
	);

	const handleDelete = async (commentId: number) => {
		await deleteComment.mutateAsync({
			id: commentId,
			projectId: +projectId!,
		});
	};

	return (
		<div className={cn("flex flex-col", className)}>
			{comments.map((comment) => (
				<CommentThread
					key={comment.id}
					comment={comment}
					onDelete={handleDelete}
					roomId={roomId}
					projectId={projectId as string}
					onRefresh={() => refetch()}
				/>
			))}
		</div>
	);
}

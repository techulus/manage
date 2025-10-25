"use client";

import { useUser } from "@clerk/nextjs";
import { Title } from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { CircleEllipsisIcon } from "lucide-react";
import { useState } from "react";
import { HtmlPreview } from "@/components/core/html-view";
import { Panel } from "@/components/core/panel";
import { UserAvatar } from "@/components/core/user-avatar";
import { DeleteButton } from "@/components/form/button";
import PostForm from "@/components/form/post";
import PageTitle from "@/components/layout/page-title";
import { CommentsSection } from "@/components/project/comment/comments-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PostWithCreator } from "@/drizzle/types";
import { displayMutationError } from "@/lib/utils/error";
import { useTRPC } from "@/trpc/client";

const categoryColors = {
	announcement: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
	fyi: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
	question:
		"bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

const categoryEmojis = {
	announcement: "📢",
	fyi: "ℹ️",
	question: "❓",
};

const formatCategory = (category: string) => {
	if (category === "fyi") return "FYI";
	return category.charAt(0).toUpperCase() + category.slice(1);
};

export default function PostsList({
	posts,
	projectId,
}: {
	posts: PostWithCreator[];
	projectId: number;
}) {
	const { user } = useUser();
	const [editing, setEditing] = useState<number | null>(null);

	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const deletePost = useMutation(
		trpc.posts.delete.mutationOptions({
			onSuccess: () => {
				setEditing(null);
				queryClient.invalidateQueries({
					queryKey: trpc.posts.list.queryKey({
						projectId,
					}),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.posts.myDrafts.queryKey({
						projectId,
					}),
				});
			},
			onError: displayMutationError,
		}),
	);

	return (
		<div className="w-full space-y-6">
			{posts.map((post) => (
				<div key={post.id}>
					<div className="relative flex flex-col justify-between p-4 bg-muted rounded-lg transition-colors w-full text-left">
						<div className="flex items-center gap-3 flex-1">
							<UserAvatar user={post.creator} />
							<div className="flex-1 min-w-0">
								<h3 className="text-sm font-medium truncate">{post.title}</h3>
								<div className="flex items-center gap-2 mt-0.5">
									<span className="text-xs text-muted-foreground">
										{post.publishedAt
											? formatDistanceToNow(new Date(post.publishedAt), {
													addSuffix: true,
												})
											: formatDistanceToNow(new Date(post.updatedAt), {
													addSuffix: true,
												})}
									</span>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Badge
									className={
										categoryColors[post.category as keyof typeof categoryColors]
									}
									variant="secondary"
								>
									<span className="mr-1">
										{
											categoryEmojis[
												post.category as keyof typeof categoryEmojis
											]
										}
									</span>
									{formatCategory(post.category)}
								</Badge>
								{post.isDraft && <Badge variant="outline">Draft</Badge>}
							</div>

							{user?.id === post.createdByUser ? (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon">
											<CircleEllipsisIcon className="h-5 w-5" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem className="w-full p-0">
											<Button
												variant="ghost"
												className="w-full"
												size="sm"
												onClick={() => {
													setEditing(post.id);
												}}
											>
												Edit
											</Button>
										</DropdownMenuItem>
										<DropdownMenuItem className="w-full p-0">
											<form
												action={async () => {
													await deletePost.mutateAsync({
														id: post.id,
													});
												}}
												className="w-full"
											>
												<DeleteButton
													action="Delete"
													className="w-full"
													compact
												/>
											</form>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							) : null}
						</div>

						<div className="mt-6">
							<HtmlPreview content={post.content ?? ""} />
						</div>
					</div>

					<div className="py-4 mt-2 ml-4">
						<CommentsSection roomId={`post/${post.id}`} />
					</div>

					<Panel open={editing === post.id}>
						<Title>
							<PageTitle title="Edit Post" compact />
						</Title>
						<PostForm item={post} setEditing={setEditing} />
					</Panel>
				</div>
			))}
		</div>
	);
}

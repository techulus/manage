"use client";

import { useUser } from "@clerk/nextjs";
import { Title } from "@radix-ui/react-dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleEllipsisIcon } from "lucide-react";
import { useParams } from "next/navigation";
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
import { displayMutationError } from "@/lib/utils/error";
import { useTRPC } from "@/trpc/client";
import { formatDistanceToNow } from "date-fns";

const categoryColors = {
	announcement: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
	fyi: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
	question: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

const formatCategory = (category: string) => {
	if (category === "fyi") return "FYI";
	return category.charAt(0).toUpperCase() + category.slice(1);
};

interface Post {
	id: number;
	title: string;
	content: string | null;
	metadata: any;
	category: string;
	isDraft: boolean;
	publishedAt: Date | null;
	updatedAt: Date;
	creator: {
		id: string;
		firstName: string | null;
		lastName: string | null;
		imageUrl: string | null;
	};
}

export default function PostsList({
	posts,
	projectId,
	isDraft = false,
}: {
	posts: Post[];
	projectId: number;
	isDraft?: boolean;
}) {
	const { user } = useUser();
	const [editing, setEditing] = useState<number | null>(null);
	const [viewing, setViewing] = useState<number | null>(null);

	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const { data: viewingPost } = useQuery({
		...trpc.posts.get.queryOptions({
			id: viewing!,
		}),
		enabled: !!viewing,
	});

	const deletePost = useMutation(
		trpc.posts.delete.mutationOptions({
			onSuccess: () => {
				setViewing(null);
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
		<div className="w-full space-y-2">
			{posts.map((post) => (
				<div key={post.id}>
					<div
						className="relative flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer transition-colors"
						onClick={() => setViewing(post.id)}
					>
						<div className="flex items-center gap-3 flex-1">
							<UserAvatar user={post.creator} size="sm" />
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
								<Badge className={categoryColors[post.category as keyof typeof categoryColors]} variant="secondary">
									{formatCategory(post.category)}
								</Badge>
								{post.isDraft && (
									<Badge variant="outline">Draft</Badge>
								)}
							</div>
						</div>
					</div>

					<Panel open={viewing === post.id} setOpen={() => setViewing(null)}>
						<Title>
							<PageTitle
								title={viewingPost?.title || ""}
								actions={
									<div className="flex items-center gap-2">
										{viewingPost?.createdByUser === user?.id && (
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
																setViewing(null);
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
										)}
										<Button variant="outline" onClick={() => setViewing(null)}>
											Close
										</Button>
									</div>
								}
								compact
							/>
						</Title>
						{viewingPost && (
							<div className="flex-1 overflow-y-auto px-6 pb-6">
								<div className="flex items-center gap-3 mb-4">
									<UserAvatar user={viewingPost.creator} />
									<div>
										<div className="font-medium">
											{viewingPost.creator.firstName} {viewingPost.creator.lastName}
										</div>
										<div className="text-xs text-muted-foreground">
											{viewingPost.publishedAt
												? formatDistanceToNow(new Date(viewingPost.publishedAt), {
														addSuffix: true,
													})
												: formatDistanceToNow(new Date(viewingPost.updatedAt), {
														addSuffix: true,
													})}
										</div>
									</div>
									<Badge className={categoryColors[viewingPost.category as keyof typeof categoryColors]}>
										{formatCategory(viewingPost.category)}
									</Badge>
									{viewingPost.isDraft && (
										<Badge variant="outline">Draft</Badge>
									)}
								</div>

								{viewingPost.content && (
									<div className="mb-6">
										<HtmlPreview content={viewingPost.content} />
									</div>
								)}

								<div className="border-t pt-4">
									<CommentsSection roomId={`post/${viewingPost.id}`} />
								</div>
							</div>
						)}
					</Panel>

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

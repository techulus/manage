"use client";

import { HtmlPreview } from "@/components/core/html-view";
import { SpinnerWithSpacing } from "@/components/core/loaders";
import { UserAvatar } from "@/components/core/user-avatar";
import { DeleteButton } from "@/components/form/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useUser } from "@clerk/nextjs";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { CircleEllipsisIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { Suspense } from "react";

export function Comments({
	roomId,
	className,
}: {
	roomId: string;
	className?: string;
}) {
	const { projectId } = useParams();
	const { user } = useUser();
	const queryClient = useQueryClient();

	const trpc = useTRPC();
	const { data: comments = [] } = useSuspenseQuery(
		trpc.projects.getComments.queryOptions({
			roomId,
		}),
	);
	const deleteComment = useMutation(
		trpc.projects.deleteComment.mutationOptions(),
	);

	return (
		<Suspense fallback={<SpinnerWithSpacing />}>
			<div className={cn("flex flex-col divide-y", className)}>
				{comments.map((comment) => (
					<div key={comment.id} className="relative flex pt-2">
						<div className="flex space-x-4">
							<div className="hidden w-[160px] text-xs text-muted-foreground md:block">
								{new Date(comment.createdAt).toLocaleString()}
							</div>
							{comment.creator ? <UserAvatar user={comment.creator} /> : null}
							<div>
								<div className="font-semibold">
									<span className="text-primary">
										{comment.creator?.firstName ?? "User"}
									</span>
									<span className="ml-2 text-xs text-muted-foreground md:hidden">
										{new Date(comment.createdAt).toLocaleString()}
									</span>
								</div>
								<HtmlPreview content={comment.content} />

								{comment.creator?.id === user?.id ? (
									<DropdownMenu>
										<DropdownMenuTrigger className="absolute right-2 top-4">
											<CircleEllipsisIcon className="h-6 w-6" />
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem className="m-0 p-0">
												<form
													action={async () => {
														await deleteComment.mutateAsync({
															id: comment.id,
															projectId: +projectId!,
														});
														queryClient.invalidateQueries({
															queryKey: trpc.projects.getComments.queryKey({
																roomId,
															}),
														});
													}}
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
						</div>
					</div>
				))}
			</div>
		</Suspense>
	);
}

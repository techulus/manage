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
			<div
				className={cn("flex flex-col divide-y dark:divide-white/10", className)}
			>
				{comments.map((comment) => (
					<div key={comment.id} className="relative flex pt-2">
						<div className="flex space-x-4">
							<div className="hidden min-w-[160px] text-xs text-muted-foreground md:block">
								{new Date(comment.createdAt).toLocaleString()}
							</div>
							{comment.creator ? <UserAvatar user={comment.creator} /> : null}
							<div className="w-full">
								<div className="font-semibold">
									<span className="text-primary text-sm">
										{comment.creator?.firstName ?? "User"}
									</span>
									<span className="ml-2 text-xs text-muted-foreground md:hidden">
										{new Date(comment.createdAt).toLocaleString()}
									</span>
								</div>
								<HtmlPreview content={comment.content} />

								{comment.creator?.id === user?.id ? (
									<DropdownMenu>
										<DropdownMenuTrigger className="absolute right-2 top-[8px]">
											<CircleEllipsisIcon className="h-5 w-5" />
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
						</div>
					</div>
				))}
			</div>
		</Suspense>
	);
}

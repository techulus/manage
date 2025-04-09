"use client";

import { deleteComment } from "@/app/(dashboard)/[tenant]/projects/actions";
import { HtmlPreview } from "@/components/core/html-view";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleEllipsisIcon } from "lucide-react";
import { usePathname } from "next/navigation";

export function Comments({
	parentId,
	projectId,
	type,
	className,
}: {
	type: string;
	parentId: string | number;
	projectId: string | number;
	className?: string;
}) {
	const { user } = useUser();
	const pathname = usePathname();
	const queryClient = useQueryClient();

	const trpc = useTRPC();
	const { data: comments = [] } = useQuery(
		trpc.projects.getComments.queryOptions({
			parentId: +parentId,
			type,
		}),
	);

	return (
		<div className={cn("flex flex-col divide-y", className)}>
			{comments.map((comment) => (
				<div
					key={`${comment.type}-${comment.id}`}
					className="relative flex pt-2"
				>
					<div className="flex space-x-4">
						<div className="hidden w-[160px] text-xs text-muted-foreground md:block">
							{new Date(comment.createdAt).toLocaleString()}
						</div>
						{comment.creator ? <UserAvatar user={comment.creator} /> : null}
						<div>
							<div className="font-semibold">
								{comment.creator?.firstName ?? "User"}
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
												action={async (formData: FormData) => {
													formData.append("currentPath", pathname);
													await deleteComment(formData);
													queryClient.invalidateQueries({
														queryKey: trpc.projects.getComments.queryKey({
															parentId: +parentId,
															type,
														}),
													});
												}}
											>
												<input type="hidden" name="id" value={comment.id} />
												<input
													type="hidden"
													name="projectId"
													value={projectId}
												/>
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
	);
}

import { deleteComment } from "@/app/(dashboard)/[tenant]/projects/actions";
import { MarkdownView } from "@/components/core/markdown-view";
import { UserAvatar } from "@/components/core/user-avatar";
import { DeleteButton } from "@/components/form/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { comment } from "@/drizzle/schema";
import { cn } from "@/lib/utils";
import { database } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { and, desc, eq } from "drizzle-orm";
import { CircleEllipsisIcon } from "lucide-react";

export async function Comments({
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
	const { userId } = await getOwner();

	const db = await database();
	const comments = await db.query.comment.findMany({
		where: and(eq(comment.parentId, +parentId), eq(comment.type, type)),
		orderBy: desc(comment.createdAt),
		with: {
			creator: true,
		},
	});

	return (
		<div className={cn("flex flex-col divide-y-2", className)}>
			{comments.map((comment) => (
				<div
					key={`${comment.type}-${comment.id}`}
					className="relative flex pt-4"
				>
					<div className="flex space-x-4">
						<div className="hidden w-[160px] text-xs text-gray-500 md:block">
							{new Date(comment.createdAt).toLocaleString()}
						</div>
						{comment.creator ? <UserAvatar user={comment.creator} /> : null}
						<div>
							<div className="font-semibold">
								{comment.creator?.firstName ?? "User"}
								<span className="ml-2 text-xs text-gray-500 md:hidden">
									{new Date(comment.createdAt).toLocaleString()}
								</span>
							</div>
							<div>
								<MarkdownView content={comment.content} />
							</div>

							{comment.creator?.id === userId ? (
								<DropdownMenu>
									<DropdownMenuTrigger className="absolute right-2 top-4">
										<CircleEllipsisIcon className="h-6 w-6" />
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem className="m-0 p-0">
											<form action={deleteComment}>
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

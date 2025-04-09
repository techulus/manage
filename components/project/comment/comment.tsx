"use client";

import { addComment } from "@/app/(dashboard)/[tenant]/projects/actions";
import { UserAvatar } from "@/components/core/user-avatar";
import Editor from "@/components/editor";
import { ActionButton } from "@/components/form/button";
import type { User } from "@/drizzle/types";
import { useTRPC } from "@/trpc/client";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";

export default function CommentForm({
	type,
	parentId,
	projectId,
	creator,
}: {
	type: string;
	parentId: string | number;
	projectId: string | number;
	creator: User;
}) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const pathname = usePathname();

	return (
		<form
			className="pb-12"
			action={async (formData: FormData) => {
				formData.append("currentPath", pathname);
				formData.append("type", type);
				formData.append("parentId", parentId.toString());
				formData.append("projectId", projectId.toString());
				await addComment(formData);
				queryClient.invalidateQueries({
					queryKey: trpc.projects.getComments.queryKey({
						parentId: +parentId,
						type,
					}),
				});
			}}
		>
			<div className="flex w-full flex-row space-x-4">
				<div className="hidden w-[160px] md:block" />

				{creator ? <UserAvatar user={creator} /> : null}

				<div className="relative flex-grow">
					<Editor name="content" />
					<ActionButton
						size="sm"
						className="absolute -bottom-12 left-0"
						label="Comment"
					/>
				</div>
			</div>
		</form>
	);
}

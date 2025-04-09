"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import CommentForm from "./comment";
import { Comments } from "./comments";

export function CommentsSection({
	type,
	parentId,
	projectId,
}: {
	type: "document" | "folder" | "tasklist" | "project" | "event";
	parentId: string | number;
	projectId: string | number;
}) {
	const trpc = useTRPC();
	const { data: creator } = useQuery(trpc.user.getCurrentUser.queryOptions());

	return (
		<div className="flex flex-col space-y-4">
			<Comments type={type} parentId={parentId} projectId={projectId} />
			{creator ? (
				<CommentForm
					type={type}
					parentId={parentId}
					projectId={projectId}
					creator={creator}
				/>
			) : null}
		</div>
	);
}

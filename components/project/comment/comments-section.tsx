"use client";

import CommentForm from "./comment";
import { Comments } from "./comments";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export function CommentsSection({ roomId }: { roomId: string }) {
	const { projectId } = useParams();
	const trpc = useTRPC();

	const { data: project } = useQuery(
		trpc.projects.getProjectById.queryOptions({
			id: +projectId!,
		}),
	);

	return (
		<div className="flex flex-col space-y-4">
			<Comments roomId={roomId} />
			{project?.canEdit && <CommentForm roomId={roomId} />}
		</div>
	);
}

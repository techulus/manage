"use client";

import { useQuery } from "@tanstack/react-query";
import { MessageSquareIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import CommentForm from "./comment";
import { Comments } from "./comments";

export function CommentsSection({ roomId }: { roomId: string }) {
	const { projectId } = useParams();
	const trpc = useTRPC();
	const [showCommentForm, setShowCommentForm] = useState(false);

	const { data: project } = useQuery(
		trpc.projects.getProjectById.queryOptions({
			id: +projectId!,
		}),
	);

	return (
		<div className="flex flex-col">
			<Comments roomId={roomId} />
			{project?.canEdit &&
				(!showCommentForm ? (
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShowCommentForm(true)}
						className="self-start text-muted-foreground hover:text-foreground"
					>
						<MessageSquareIcon className="h-4 w-4 mr-2" />
						Add comment
					</Button>
				) : (
					<CommentForm
						roomId={roomId}
						onSuccess={() => setShowCommentForm(false)}
						onCancel={() => setShowCommentForm(false)}
					/>
				))}
		</div>
	);
}

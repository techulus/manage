"use client";

import CommentForm from "./comment";
import { Comments } from "./comments";

export function CommentsSection({ roomId }: { roomId: string }) {
	return (
		<div className="flex flex-col space-y-4">
			<Comments roomId={roomId} />
			<CommentForm roomId={roomId} />
		</div>
	);
}

import { getUser } from "@/lib/utils/useOwner";
import { Suspense } from "react";
import CommentForm from "./comment";
import { Comments } from "./comments";

export async function CommentsSection({
	type,
	parentId,
	projectId,
}: {
	type: "document" | "folder" | "tasklist" | "project" | "event";
	parentId: string | number;
	projectId: string | number;
}) {
	const creator = await getUser();
	return (
		<div className="flex flex-col space-y-4">
			<Suspense
				key={`${type}-${parentId}-${projectId}`}
				fallback={
					<div className="flex flex-col gap-4 animate-pulse">
						<div className="flex space-x-4">
							<div className="hidden w-[160px] h-4 bg-muted rounded md:block" />
							<div className="h-10 w-10 rounded-full bg-muted" />
							<div className="flex-1 space-y-2">
								<div className="h-4 w-24 bg-muted rounded" />
								<div className="h-4 w-full bg-muted rounded" />
								<div className="h-4 w-3/4 bg-muted rounded" />
							</div>
						</div>
					</div>
				}
			>
				<Comments type={type} parentId={parentId} projectId={projectId} />
			</Suspense>
			<CommentForm
				type={type}
				parentId={parentId}
				projectId={projectId}
				creator={creator}
			/>
		</div>
	);
}

"use client";

import { addComment } from "@/app/(dashboard)/[tenant]/projects/actions";
import { UserAvatar } from "@/components/core/user-avatar";
import MarkdownEditor from "@/components/editor";
import { ActionButton } from "@/components/form/button";
import type { User } from "@/drizzle/types";
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
	const pathname = usePathname();

	return (
		<form className="pb-12" action={addComment}>
			<input value={pathname} type="hidden" name="currentPath" />
			<input value={parentId} type="hidden" name="parentId" />
			<input value={projectId} type="hidden" name="projectId" />
			<input value={type} type="hidden" name="type" />

			<div className="flex w-full flex-row space-x-4">
				<div className="hidden w-[160px] md:block" />

				{creator ? <UserAvatar user={creator} /> : null}

				<div className="relative flex-grow">
					<MarkdownEditor
						defaultValue={""}
						name="content"
						placeholder="Add a comment here..."
						compact
					/>
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

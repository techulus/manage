"use client";

import { addComment } from "@/app/(dashboard)/console/projects/actions";
import MarkdownEditor from "@/components/editor";
import { ActionButton } from "@/components/form/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

export default function CommentForm({
  type,
  parentId,
}: {
  type: string;
  parentId: string | number;
}) {
  const pathname = usePathname();
  const { user: creator } = useUser();

  return (
    <form className="pb-12" action={addComment}>
      <input value={pathname} type="hidden" name="currentPath" />
      <input value={parentId} type="hidden" name="parentId" />
      <input value={type} type="hidden" name="type" />

      <div className="flex w-full flex-row space-x-4">
        <div className="hidden w-[160px] md:block"></div>

        {creator?.imageUrl ? (
          <Avatar>
            <AvatarImage src={creator.imageUrl} />
            <AvatarFallback>{creator?.firstName ?? "User"}</AvatarFallback>
          </Avatar>
        ) : null}

        <div className="relative flex-grow">
          <MarkdownEditor
            defaultValue={""}
            name="content"
            placeholder="Add a comment here..."
            compact
          />
          <ActionButton
            size="sm"
            className="absolute -bottom-10 left-0"
            label="Comment"
          />
        </div>
      </div>
    </form>
  );
}

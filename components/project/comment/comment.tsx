"use client";

import { addComment } from "@/app/console/projects/actions";
import MarkdownEditor from "@/components/editor";
import { ActionButton } from "@/components/form/button";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function CommentForm({
  type,
  parentId,
}: {
  type: string;
  parentId: number;
}) {
  const pathname = usePathname();
  const { user: creator } = useUser();

  return (
    <form className="relative mt-8" action={addComment}>
      <input value={pathname} type="hidden" name="currentPath" />
      <input value={parentId} type="hidden" name="parentId" />
      <input value={type} type="hidden" name="type" />

      <div className="flex w-full flex-row space-x-4">
        {creator?.imageUrl ? (
          <Image
            src={creator?.imageUrl}
            alt={
              creator?.firstName ??
              creator?.primaryEmailAddress?.emailAddress ??
              "User"
            }
            width={36}
            height={36}
            className="h-8 w-8 rounded-full"
          />
        ) : null}

        <div className="flex-grow">
          <MarkdownEditor
            defaultValue={""}
            name="content"
            placeholder="Add a comment here..."
            compact
          />
        </div>
      </div>

      <ActionButton
        size="sm"
        className="absolute -bottom-2 left-12"
        label="Comment"
      />
    </form>
  );
}

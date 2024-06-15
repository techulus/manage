"use client";

import { addComment } from "@/app/(dashboard)/console/projects/actions";
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

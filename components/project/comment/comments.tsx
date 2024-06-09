import { deleteComment } from "@/app/console/projects/actions";
import { MarkdownView } from "@/components/core/markdown-view";
import { DeleteButton } from "@/components/form/button";
import { comment } from "@/drizzle/schema";
import { cn } from "@/lib/utils";
import { database } from "@/lib/utils/useDatabase";
import { auth } from "@clerk/nextjs";
import { and, desc, eq } from "drizzle-orm";
import Image from "next/image";

export async function Comments({
  parentId,
  type,
  className,
}: {
  type: string;
  parentId: string | number;
  className?: string;
}) {
  const { userId } = auth();

  const comments = await database().query.comment.findMany({
    where: and(eq(comment.parentId, +parentId), eq(comment.type, type)),
    orderBy: desc(comment.createdAt),
    with: {
      creator: true,
    },
  });

  return (
    <div className={cn("flex flex-col divide-y-2 border-t", className)}>
      {comments.map((comment) => (
        <div key={comment.id} className="relative flex items-center pt-4">
          <div className="flex items-center space-x-4">
            {comment.creator.imageUrl ? (
              <Image
                src={comment.creator.imageUrl}
                alt={comment.creator?.firstName ?? "User"}
                width={36}
                height={36}
                className="h-8 w-8 rounded-full"
              />
            ) : null}
            <div>
              <div className="font-semibold">
                {comment.creator?.firstName ?? "User"}
                <span className="ml-2 text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              <div>
                <MarkdownView content={comment.content} />
              </div>

              {comment.creator?.id === userId ? (
                <form className="absolute right-0 top-2" action={deleteComment}>
                  <input type="hidden" name="id" value={comment.id} />
                  <DeleteButton action="Delete" size="sm" />
                </form>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

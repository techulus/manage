import { deleteComment } from "@/app/(dashboard)/console/projects/actions";
import { MarkdownView } from "@/components/core/markdown-view";
import { DeleteButton } from "@/components/form/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { comment } from "@/drizzle/schema";
import { cn } from "@/lib/utils";
import { database } from "@/lib/utils/useDatabase";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";
import { CircleEllipsisIcon } from "lucide-react";
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
        <div
          key={`${comment.type}-${comment.id}`}
          className="relative flex pt-4"
        >
          <div className="flex space-x-4">
            <div className="hidden w-[160px] text-xs text-gray-500 md:block">
              {new Date(comment.createdAt).toLocaleString()}
            </div>
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
                <span className="ml-2 text-xs text-gray-500 md:hidden">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              <div>
                <MarkdownView content={comment.content} />
              </div>

              {comment.creator?.id === userId ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="absolute right-2 top-4">
                    <CircleEllipsisIcon className="h-6 w-6" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel className="m-0 p-0">
                      <form action={deleteComment}>
                        <input type="hidden" name="id" value={comment.id} />
                        <DeleteButton
                          action="Delete"
                          size="sm"
                          className="w-full"
                        />
                      </form>
                    </DropdownMenuLabel>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

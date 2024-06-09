import CommentForm from "./comment";
import { Comments } from "./comments";

export function CommentsSection({
  type,
  parentId,
}: {
  type: "document" | "folder" | "tasklist" | "project";
  parentId: number;
}) {
  return (
    <div className="flex flex-col space-y-4">
      <Comments type={type} parentId={parentId} />
      <CommentForm type={type} parentId={parentId} />
    </div>
  );
}

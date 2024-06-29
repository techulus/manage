import CommentForm from "./comment";
import { Comments } from "./comments";

export function CommentsSection({
  type,
  parentId,
  projectId,
}: {
  type: "document" | "folder" | "tasklist" | "project" | "event";
  parentId: string | number;
  projectId: string | number;
}) {
  return (
    <div className="flex flex-col space-y-4">
      {/* @ts-ignore */}
      <Comments type={type} parentId={parentId} projectId={projectId} />
      <CommentForm type={type} parentId={parentId} projectId={projectId} />
    </div>
  );
}

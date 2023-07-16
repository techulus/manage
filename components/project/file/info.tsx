import { BlobWithCreater } from "@/drizzle/types";
import Link from "next/link";
import { CreatorDetails } from "../shared/creator-details";
import { getFileUrl } from "@/lib/blobStore";

export const FileInfo = ({ file }: { file: BlobWithCreater }) => {
  const fileUrl = getFileUrl(file);
  return (
    <div className="relative flex h-[180px] gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6 dark:bg-gray-900">
      <Link href={fileUrl} className="flex flex-col text-sm font-medium">
        <span className="absolute inset-0" aria-hidden="true" />
        <div className="flex-shrink space-y-2">
          <div className="text-xl font-medium leading-6">{file.name}</div>
        </div>

        <CreatorDetails user={file.creator} updatedAt={file.updatedAt} />
      </Link>
    </div>
  );
};

/* eslint-disable @next/next/no-img-element */
import { BlobWithCreater } from "@/drizzle/types";
import { getFileUrl } from "@/lib/blobStore";
import Link from "next/link";
import { CreatorDetails } from "../shared/creator-details";

export const FileInfo = ({ file }: { file: BlobWithCreater }) => {
  const fileUrl = getFileUrl(file);
  return (
    <div className="relative flex h-[240px] gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6 dark:bg-gray-900">
      <Link
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col text-sm font-medium"
      >
        <span className="absolute inset-0" aria-hidden="true" />
        <div className="flex-shrink space-y-2">
          <div className="flex-shrink space-y-2">
            <div className="text-xl font-medium leading-6">{file.name}</div>
          </div>

          <CreatorDetails user={file.creator} updatedAt={file.updatedAt} />
        </div>
        {file.contentType.includes("image") ? (
          <div className="-bottom-26 absolute left-0 pt-24">
            <img
              src={fileUrl}
              alt={file.name}
              className="h-auto w-full opacity-30"
            />
          </div>
        ) : null}
      </Link>
    </div>
  );
};

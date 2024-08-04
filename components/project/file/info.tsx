/* eslint-disable @next/next/no-img-element */
import {
  deleteBlob,
  reloadDocuments,
} from "@/app/(dashboard)/console/projects/[projectId]/documents/actions";
import { DeleteButton } from "@/components/form/button";
import type { BlobWithCreater } from "@/drizzle/types";
import { getFileUrl } from "@/lib/blobStore";
import Link from "next/link";
import { CreatorDetails } from "../shared/creator-details";

export const FileInfo = ({
  file,
  projectId,
  folderId,
}: {
  file: BlobWithCreater;
  projectId: number;
  folderId: number | null;
}) => {
  const fileUrl = getFileUrl(file);
  return (
    <div className="relative flex h-[240px] gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6 dark:bg-gray-900">
      {file.contentType.includes("image") ? (
        <div className="absolute left-0 top-0">
          <img
            src={fileUrl}
            alt={file.name}
            className="h-auto w-full opacity-30"
          />
        </div>
      ) : null}

      <span
        className="absolute inset-0 top-0 z-0 bg-gradient-to-b from-gray-100 dark:from-black"
        aria-hidden="true"
      />

      <Link
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full flex-col justify-between text-sm font-medium"
        prefetch={false}
      >
        {/* <span className="absolute inset-0" aria-hidden="true" /> */}
        <div className="z-10 flex-shrink space-y-2">
          <div className="flex-shrink space-y-2">
            <div className="text-xl font-medium leading-6">{file.name}</div>
          </div>

          <CreatorDetails user={file.creator} updatedAt={file.updatedAt} />
        </div>
      </Link>

      <div className="absolute bottom-2 right-2 flex">
        <form
          action={async () => {
            "use server";
            await deleteBlob(file);
            await reloadDocuments(+projectId, folderId);
          }}
        >
          <DeleteButton action="Delete" />
        </form>
      </div>
    </div>
  );
};

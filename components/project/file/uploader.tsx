"use client";

import { Spinner } from "@/components/core/loaders";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";

export function FileUploader({
  folderId,
  projectId,
}: {
  folderId: number;
  projectId: number;
}) {
  const [loading, setLoading] = useState(false);
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setLoading(true);

      const uploaders = acceptedFiles.map(async (file) => {
        try {
          return fetch(
            `/api/blob?folder=${folderId}&name=${file.name}&projectId=${projectId}`,
            {
              method: "put",
              body: file,
            }
          ).then((res) => res.json());
        } catch (e) {
          console.error(e);
          return null;
        }
      });

      toast
        .promise(Promise.all(uploaders), {
          loading: "Uploading...",
          success: "Uploaded!",
          error: "Failed to upload file(s)",
        })
        .finally(() => setLoading(false));
    },
    [folderId, projectId]
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()} className="flex items-center">
      <input {...getInputProps()} disabled={loading} />
      <p className="text-sm">Drop files here!</p>
      {loading && <Spinner className="ml-2" />}
    </div>
  );
}

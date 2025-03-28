"use client";

import { Spinner } from "@/components/core/loaders";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

export function FileUploader({
	folderId,
	projectId,
	reloadDocuments,
}: {
	folderId?: number;
	projectId: number | string;
	reloadDocuments: (projectId: string, folderId: string) => void;
}) {
	const [loading, setLoading] = useState(false);
	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			setLoading(true);

			const uploaders = acceptedFiles.map(async (file) => {
				try {
					return fetch(
						folderId
							? `/api/blob?folder=${folderId}&name=${file.name}&projectId=${projectId}`
							: `/api/blob?name=${file.name}&projectId=${projectId}`,
						{
							method: "put",
							body: file,
						},
					)
						.then((res) => res.json())
						.then(() => reloadDocuments(String(projectId), String(folderId)));
				} catch (e) {
					console.error(e);
					return null;
				}
			});

			toast.promise(
				Promise.all(uploaders).finally(() => setLoading(false)),
				{
					loading: "Uploading...",
					success: "Uploaded!",
					error: "Failed to upload file(s)",
				},
			);
		},
		[folderId, projectId, reloadDocuments],
	);

	const { getRootProps, getInputProps } = useDropzone({ onDrop });

	return (
		<div
			{...getRootProps()}
			className="flex items-center rounded-full border bg-card px-3 py-1"
		>
			<input {...getInputProps()} disabled={loading} />
			<p className="text-sm">Drop files here!</p>
			{loading && <Spinner className="ml-2 text-primary" />}
		</div>
	);
}

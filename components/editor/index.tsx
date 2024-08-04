import type { BlobUploadResult } from "@/app/(api)/api/blob/route";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { notifyError } from "../core/toast";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
	ssr: false,
});

export default function MarkdownEditor({
	defaultValue,
	name = "description",
	compact = false,
	placeholder = "Type here...",
	setValue = () => {},
}: {
	defaultValue?: string;
	name?: string;
	compact?: boolean;
	placeholder?: string;
	setValue?: (value: string) => void;
}) {
	const [value, onChange] = useState(defaultValue ?? "");

	const onUploadImage = useCallback(
		async (
			file: File,
			onSuccess: (url: string) => void,
			onError: (error: string) => void,
		) => {
			try {
				const result: BlobUploadResult = await fetch(
					`/api/blob?name=${file.name}`,
					{
						method: "PUT",
						body: file,
					},
				).then((res) => res.json());
				return onSuccess(result.url);
			} catch (e) {
				console.error(e);
				notifyError("Failed to upload image");
				onError("Failed to upload image");
			}
		},
		[],
	);

	const options = useMemo(() => {
		return {
			autofocus: !compact,
			spellChecker: false,
			uploadImage: true,
			imageUploadFunction: onUploadImage,
			maxHeight: compact ? "80px" : "240px",
			placeholder,
		};
	}, [onUploadImage, placeholder, compact]);

	return (
		<>
			<input type="hidden" name={name} defaultValue={value} />
			<SimpleMDE
				className={compact ? "simplemde-compact" : ""}
				options={options}
				value={value}
				onChange={(value) => {
					onChange(value);
					setValue(value);
				}}
			/>
		</>
	);
}

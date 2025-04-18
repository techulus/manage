"use client";

import { BlockNoteEditor, type PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { memo, useEffect, useMemo, useState } from "react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useFormStatus } from "react-dom";
import { Spinner } from "../core/loaders";

const Editor = memo(function Editor({
	defaultValue,
	metadata = undefined,
	name = "description",
	allowImageUpload = false,
}: {
	defaultValue?: string;
	name?: string;
	metadata?: PartialBlock[] | undefined;
	allowImageUpload?: boolean;
}) {
	const { pending } = useFormStatus();
	const [value, onChange] = useState(defaultValue ?? "");
	const [blocks, setBlocks] = useState<PartialBlock[]>([]);
	const [initialContent, setInitialContent] = useState<
		PartialBlock[] | undefined | "loading"
	>("loading");

	useEffect(() => {
		if (defaultValue) {
			BlockNoteEditor.create()
				.tryParseHTMLToBlocks(defaultValue)
				.then((blocks) => {
					setInitialContent(blocks);
				});
		} else {
			setInitialContent(undefined);
		}
	}, [defaultValue]);

	const editor = useMemo(() => {
		if (metadata) {
			return BlockNoteEditor.create({ initialContent: metadata });
		}
		if (initialContent === "loading") {
			return undefined;
		}
		return BlockNoteEditor.create({
			initialContent,
			uploadFile: allowImageUpload
				? async (file, blockId) => {
						console.log(file, blockId);
						const result: { url: string } = await fetch(
							`/api/blob?name=${file.name}`,
							{
								method: "PUT",
								body: file,
							},
						).then((res) => res.json());
						return result.url;
					}
				: undefined,
		});
	}, [initialContent, metadata, allowImageUpload]);

	useEffect(() => {
		if (defaultValue) {
			return;
		}

		if (editor && !pending) {
			const allBlockIds = editor.document.map((block) => block.id);
			editor.removeBlocks(allBlockIds);
		}
	}, [editor, pending, defaultValue]);

	if (editor === undefined) {
		return <Spinner />;
	}

	return (
		<>
			<input type="hidden" name={name} defaultValue={value} />
			<input
				type="hidden"
				name={"metadata"}
				defaultValue={JSON.stringify(blocks)}
			/>
			<BlockNoteView
				editor={editor}
				onChange={async () => {
					const isEmpty =
						editor.document.length === 1 &&
						editor.document[0].type === "paragraph" &&
						editor.document[0].content?.length === 0 &&
						editor.document[0].children?.length === 0;

					setBlocks(editor.document);
					if (isEmpty) {
						onChange("");
					} else {
						const html = await editor.blocksToFullHTML(editor.document);
						onChange(html);
					}
				}}
			/>
		</>
	);
});

export default Editor;

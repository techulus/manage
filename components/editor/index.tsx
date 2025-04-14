"use client";

import { BlockNoteEditor, type PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useEffect, useMemo, useState } from "react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useFormStatus } from "react-dom";
import { Spinner } from "../core/loaders";

export default function Editor({
	defaultValue,
	metadata = undefined,
	name = "description",
}: {
	defaultValue?: string;
	name?: string;
	metadata?: PartialBlock[] | undefined;
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
			uploadFile: async (file, blockId) => {
				console.log(file, blockId);
				const result: { url: string } = await fetch(
					`/api/blob?name=${file.name}`,
					{
						method: "PUT",
						body: file,
					},
				).then((res) => res.json());
				return result.url;
			},
		});
	}, [initialContent, metadata]);

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
					setBlocks(editor.document);
					const html = await editor.blocksToFullHTML(editor.document);
					onChange(html);
				}}
			/>
		</>
	);
}

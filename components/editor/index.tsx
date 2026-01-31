"use client";

import {
	BlockNoteEditor,
	BlockNoteSchema,
	defaultInlineContentSpecs,
	type PartialBlock,
} from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { SuggestionMenuController, useCreateBlockNote } from "@blocknote/react";
import { memo, useEffect, useState } from "react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useQuery } from "@tanstack/react-query";
import { useFormStatus } from "react-dom";
import { useTRPC } from "@/trpc/client";
import { Spinner } from "../core/loaders";
import { Mention } from "./mention";
import { MentionSuggestionMenu } from "./mention-suggestion-menu";

const schema = BlockNoteSchema.create({
	inlineContentSpecs: {
		...defaultInlineContentSpecs,
		mention: Mention,
	},
});

type BlockNoteEditorType = typeof schema.BlockNoteEditor;
type CustomPartialBlock = PartialBlock<
	typeof schema.blockSchema,
	typeof schema.inlineContentSchema,
	typeof schema.styleSchema
>;

const Editor = memo(function Editor({
	defaultValue,
	metadata = undefined,
	name = "description",
	allowImageUpload = false,
	onMentionAdded,
	onContentChange,
}: {
	defaultValue?: string;
	name?: string;
	metadata?: PartialBlock[] | undefined;
	allowImageUpload?: boolean;
	onMentionAdded?: (userId: string) => void;
	onContentChange?: (content: string) => void;
}) {
	const { pending } = useFormStatus();
	const [value, onChange] = useState(defaultValue ?? "");
	const [blocks, setBlocks] = useState<CustomPartialBlock[]>([]);
	const [initialContent, setInitialContent] = useState<
		CustomPartialBlock[] | undefined | "loading"
	>("loading");
	const [mentionedUsers, setMentionedUsers] = useState<Set<string>>(new Set());

	useEffect(() => {
		if (defaultValue) {
			BlockNoteEditor.create({ schema })
				.tryParseHTMLToBlocks(defaultValue)
				.then((blocks) => {
					setInitialContent(blocks as CustomPartialBlock[]);
				});
		} else {
			setInitialContent(undefined);
		}
	}, [defaultValue]);

	const [userSearchQuery, setUserSearchQuery] = useState<string>("");
	const trpc = useTRPC();

	const { data: users = [] } = useQuery(
		trpc.user.searchUsersForMention.queryOptions({ query: userSearchQuery }),
	);

	const getMentionMenuItems = (editor: BlockNoteEditorType) => {
		return users.map((user) => {
			const userName =
				`${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email;
			return {
				title: userName,
				user,
				onItemClick: () => {
					editor.insertInlineContent([
						{
							type: "mention",
							props: {
								userId: user.id,
								userName: userName,
							},
						},
						" ",
					]);
					if (!mentionedUsers.has(user.id)) {
						setMentionedUsers((prev) => new Set(prev).add(user.id));
						if (onMentionAdded) {
							onMentionAdded(user.id);
						}
					}
				},
			};
		});
	};

	const editor = useCreateBlockNote(
		{
			schema,
			initialContent:
				initialContent === "loading" ? undefined : metadata || initialContent,
			uploadFile: allowImageUpload
				? async (file) => {
						const presignRes = await fetch("/api/blob/presign", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								fileName: file.name,
								contentType: file.type,
								contentSize: file.size,
							}),
						});

						if (!presignRes.ok) {
							const error = await presignRes.json();
							throw new Error(error.error || "Failed to get upload URL");
						}

						const { uploadUrl, fileId } = await presignRes.json();

						const uploadRes = await fetch(uploadUrl, {
							method: "PUT",
							headers: { "Content-Type": file.type },
							body: file,
						});

						if (!uploadRes.ok) {
							throw new Error("Failed to upload file to storage");
						}

						const confirmRes = await fetch("/api/blob/confirm", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ fileId }),
						});

						if (!confirmRes.ok) {
							const error = await confirmRes.json();
							throw new Error(error.error || "Failed to confirm upload");
						}

						const { url } = await confirmRes.json();
						return url;
					}
				: undefined,
		},
		[initialContent, metadata, allowImageUpload],
	);

	useEffect(() => {
		if (defaultValue || !editor || pending) {
			return;
		}

		try {
			editor.replaceBlocks(editor.document, [
				{
					type: "paragraph",
					content: "",
				},
			]);
			setMentionedUsers(new Set());
		} catch (error) {
			console.debug("Could not reset editor:", error);
		}
	}, [editor, pending, defaultValue]);

	if (editor === undefined || initialContent === "loading") {
		return <Spinner />;
	}

	return (
		<div className="bg-muted rounded-md">
			<input type="hidden" name={name} defaultValue={value} />
			<input type="hidden" name={"metadata"} value={JSON.stringify(blocks)} />
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
						onContentChange?.("");
					} else {
						const html = await editor.blocksToFullHTML(editor.document);
						onChange(html);
						onContentChange?.(html);
					}
				}}
			>
				{/* TypeScript workaround: BlockNote's SuggestionMenuController has strict typing
				    that doesn't accommodate our custom MentionSuggestionItem with user data.
				    The 'as any' is necessary because we're extending the base suggestion item 
				    structure with additional properties that BlockNote doesn't expect. */}
				<SuggestionMenuController
					triggerCharacter="@"
					suggestionMenuComponent={MentionSuggestionMenu as any}
					getItems={async (query) => {
						setUserSearchQuery(query || "");
						const items = getMentionMenuItems(editor);
						if (!query) return items;
						const lowerQuery = query.toLowerCase();
						return items.filter((item) => {
							return item.title.toLowerCase().includes(lowerQuery);
						});
					}}
				/>
			</BlockNoteView>
		</div>
	);
});

export default Editor;

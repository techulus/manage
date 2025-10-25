"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { parseAsBoolean, useQueryState } from "nuqs";
import {
	type Dispatch,
	memo,
	type SetStateAction,
	useRef,
	useState,
} from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { displayMutationError } from "@/lib/utils/error";
import { useTRPC } from "@/trpc/client";
import { Spinner } from "../core/loaders";
import Editor from "../editor";
import { Button } from "../ui/button";

interface Post {
	id: number;
	title: string;
	content: string | null;
	metadata: unknown;
	category: string;
	isDraft: boolean;
}

const PostForm = memo(
	({
		item,
		setEditing,
	}: {
		item?: Post;
		setEditing?: Dispatch<SetStateAction<number | null>>;
	}) => {
		const { projectId } = useParams();

		const [_, setCreate] = useQueryState(
			"create",
			parseAsBoolean.withDefault(false),
		);

		const trpc = useTRPC();
		const queryClient = useQueryClient();
		const upsertPost = useMutation(
			trpc.posts.upsert.mutationOptions({
				onSuccess: (data) => {
					setCreate(null);
					setEditing?.(null);
					queryClient.invalidateQueries({
						queryKey: trpc.posts.list.queryKey({
							projectId: +projectId!,
						}),
					});
					queryClient.invalidateQueries({
						queryKey: trpc.posts.myDrafts.queryKey({
							projectId: +projectId!,
						}),
					});
					if (data.id) {
						queryClient.invalidateQueries({
							queryKey: trpc.posts.get.queryKey({
								id: data.id,
							}),
						});
					}
				},
				onError: displayMutationError,
			}),
		);

		const [title, setTitle] = useState(item?.title ?? "");
		const [category, setCategory] = useState<
			"announcement" | "fyi" | "question"
		>(
			(item?.category as "announcement" | "fyi" | "question") ?? "announcement",
		);

		const formRef = useRef<HTMLFormElement>(null);

		const savePost = (formData: FormData, isDraft = false) => {
			const content = formData.get("content") as string;
			const metadata = formData.get("metadata");

			upsertPost.mutate({
				title,
				content,
				metadata: metadata ? JSON.parse(metadata as string) : undefined,
				category,
				projectId: +projectId!,
				id: item?.id ?? undefined,
				isDraft,
			});
		};

		return (
			<form className="flex-1 overflow-hidden overflow-y-auto" ref={formRef}>
				<div className="px-6 space-y-6">
					<div className="space-y-2">
						<Label htmlFor="title">Title</Label>
						<Input
							type="text"
							name="title"
							id="title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="category">Category</Label>
						<Select
							name="category"
							value={category}
							onValueChange={(value: any) => setCategory(value)}
						>
							<SelectTrigger id="category">
								<SelectValue />
							</SelectTrigger>
							<SelectContent position="popper">
								<SelectItem value="announcement">Announcement</SelectItem>
								<SelectItem value="fyi">FYI</SelectItem>
								<SelectItem value="question">Question</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="content">Content</Label>
						<Editor
							key={item?.id ?? "new"}
							defaultValue={item?.content ?? ""}
							{...(item?.metadata &&
							Array.isArray(item.metadata) &&
							item.metadata.length > 0
								? { metadata: item.metadata }
								: {})}
							name="content"
							allowImageUpload={true}
						/>
					</div>
				</div>
				<div className="ml-auto flex items-center justify-end gap-x-6 p-4">
					<Button
						type="button"
						variant="ghost"
						onClick={() => {
							setCreate(null);
							setEditing?.(null);
						}}
					>
						Cancel
					</Button>

					<div className="ml-auto space-x-4">
						{upsertPost.isPending ? (
							<Spinner />
						) : (
							<>
								<Button
									type="button"
									disabled={upsertPost.isPending}
									variant="outline"
									onClick={() => {
										const form = formRef.current;
										if (form) {
											const formData = new FormData(form);
											savePost(formData, true);
										}
									}}
								>
									Save draft
								</Button>
								<Button
									type="button"
									disabled={upsertPost.isPending}
									onClick={() => {
										const form = formRef.current;
										if (form) {
											const formData = new FormData(form);
											savePost(formData);
										}
									}}
								>
									Publish
								</Button>
							</>
						)}
					</div>
				</div>
			</form>
		);
	},
);

export default PostForm;

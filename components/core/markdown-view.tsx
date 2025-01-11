"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const MarkdownView = ({ content }: { content: string }) => {
	return (
		<ReactMarkdown
			remarkPlugins={[remarkGfm]}
			className="prose max-w-5xl dark:prose-invert"
		>
			{content}
		</ReactMarkdown>
	);
};

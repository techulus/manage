"use client";

import ReactMarkdown from "react-markdown";

export const MarkdownView = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown className="prose dark:prose-invert max-w-5xl">{content}</ReactMarkdown>
  );
};

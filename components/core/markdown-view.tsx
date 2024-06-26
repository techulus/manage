"use client";

import ReactMarkdown from "react-markdown";

export const MarkdownView = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown className="prose max-w-5xl dark:prose-invert">
      {content}
    </ReactMarkdown>
  );
};

"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/core/style.css";

export const HtmlPreview = ({ content }: { content: string }) => {
	// const sanitizedContent = DOMPurify.sanitize(content);

	return (
		<div
			className="block"
			suppressHydrationWarning
			// biome-ignore lint/security/noDangerouslySetInnerHtml: Using DOMPurify for sanitization
			dangerouslySetInnerHTML={{ __html: content }}
		/>
	);
};

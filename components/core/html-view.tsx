"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/core/style.css";
import { useRef } from "react";
import { MentionTooltipHandler } from "./mention-tooltip-handler";

export const HtmlPreview = ({ content }: { content: string }) => {
	const containerRef = useRef<HTMLDivElement>(null);

	return (
		<>
			<div
				ref={containerRef}
				className="block"
				suppressHydrationWarning
				// biome-ignore lint/security/noDangerouslySetInnerHtml: Using DOMPurify for sanitization
				dangerouslySetInnerHTML={{ __html: content }}
			/>
			<MentionTooltipHandler containerRef={containerRef} content={content} />
		</>
	);
};

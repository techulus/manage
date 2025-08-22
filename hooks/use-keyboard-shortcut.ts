import { useEffect } from "react";

export function useKeyboardShortcut(
	key: string,
	callback: () => void,
	enabled = true,
) {
	useEffect(() => {
		if (!enabled) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (
				(e.key === key || e.key === key.toUpperCase()) &&
				!e.metaKey &&
				!e.ctrlKey &&
				!e.altKey &&
				!e.repeat
			) {
				const target = e.target as HTMLElement;

				if (
					target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					target.isContentEditable ||
					target.closest('[contenteditable="true"]')
				) {
					return;
				}

				e.preventDefault();
				callback();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [key, callback, enabled]);
}


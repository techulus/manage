import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { UserAvatar } from "@/components/core/user-avatar";
import { useTRPC } from "@/trpc/client";

interface TooltipState {
	show: boolean;
	userId: string;
	x: number;
	y: number;
}

interface MentionTooltipHandlerProps {
	containerRef: React.RefObject<HTMLDivElement | null>;
	content: string;
}

export function MentionTooltipHandler({
	containerRef,
}: MentionTooltipHandlerProps) {
	const [tooltip, setTooltip] = useState<TooltipState>({
		show: false,
		userId: "",
		x: 0,
		y: 0,
	});

	const trpc = useTRPC();

	const { data: users, isLoading } = useQuery(
		trpc.user.searchUsersForMention.queryOptions({ query: "" }),
	);

	const user = users?.find((u) => u.id === tooltip.userId);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const handleMouseEnter = (e: Event) => {
			const target = e.target as HTMLElement;
			const userId = target.getAttribute("data-user-id");

			if (userId) {
				const rect = target.getBoundingClientRect();
				const newTooltip = {
					show: true,
					userId,
					x: rect.left + rect.width / 2,
					y: rect.top,
				};
				setTooltip(newTooltip);
			}
		};

		const handleMouseLeave = (e: Event) => {
			const target = e.target as HTMLElement;
			if (target.getAttribute("data-user-id")) {
				setTooltip((prev) => ({ ...prev, show: false }));
			}
		};

		// Find all mention spans and add event listeners
		const mentionSpans = container.querySelectorAll("[data-user-id]");

		mentionSpans.forEach((span) => {
			span.addEventListener("mouseenter", handleMouseEnter);
			span.addEventListener("mouseleave", handleMouseLeave);
			// Add cursor pointer style
			(span as HTMLElement).style.cursor = "pointer";
		});

		return () => {
			mentionSpans.forEach((span) => {
				span.removeEventListener("mouseenter", handleMouseEnter);
				span.removeEventListener("mouseleave", handleMouseLeave);
			});
		};
	}, [containerRef]);

	if (!tooltip.show) return null;

	return createPortal(
		<div
			className="fixed z-[9999] pointer-events-none"
			style={{
				left: tooltip.x,
				top: tooltip.y - 10,
				transform: "translate(-50%, -100%)",
			}}
		>
			<div className="bg-muted border border-primary/20 dark:border-gray-700 rounded-lg p-1 pr-2 min-w-44">
				{isLoading ? (
					<div className="flex items-center gap-2">
						<div className="w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
						<div>
							<div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
							<div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
						</div>
					</div>
				) : user ? (
					<div className="flex items-center gap-2">
						<UserAvatar user={user} />
						<div>
							<div className="font-medium text-sm text-gray-900 dark:text-gray-100">
								{`${user.firstName || ""} ${user.lastName || ""}`.trim() ||
									"Unknown User"}
							</div>
							<div className="text-xs text-gray-500 dark:text-gray-400">
								{user.email}
							</div>
						</div>
					</div>
				) : (
					<div className="text-sm text-gray-500 dark:text-gray-400">
						User not found
					</div>
				)}
			</div>
			<div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200 dark:border-t-gray-700" />
		</div>,
		document.body,
	);
}

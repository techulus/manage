import { UserAvatar } from "@/components/core/user-avatar";
import type {
	DefaultReactSuggestionItem,
	SuggestionMenuProps,
} from "@blocknote/react";

interface User {
	id: string;
	firstName: string | null;
	lastName: string | null;
	image: string | null;
	email: string;
}

// Create a proper type that extends DefaultReactSuggestionItem
type MentionSuggestionItem = DefaultReactSuggestionItem & {
	user: User;
};

// Create a wrapper that accepts DefaultReactSuggestionItem but treats them as MentionSuggestionItem
export function MentionSuggestionMenu({
	items,
	selectedIndex,
	onItemClick,
}: SuggestionMenuProps<DefaultReactSuggestionItem>) {
	// Type assertion to tell TypeScript that these items have the 'user' property
	const mentionItems = items as (DefaultReactSuggestionItem & { user: User })[];
	const handleKeyDown = (
		e: React.KeyboardEvent,
		item: DefaultReactSuggestionItem,
	) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onItemClick?.(item);
		}
	};
	if (items.length === 0) {
		return (
			<div className="bg-background border rounded-lg shadow-lg p-2 max-w-xs">
				<div className="text-sm text-muted-foreground px-3 py-2">
					No users found
				</div>
			</div>
		);
	}

	return (
		<div className="bg-background border rounded-lg shadow-lg p-1 max-w-xs max-h-48 overflow-y-auto">
			{mentionItems.map((item, index) => (
				<button
					key={item.user.id}
					type="button"
					className={`flex items-center gap-2 px-3 py-2 cursor-pointer rounded w-full text-left ${
						index === selectedIndex ? "bg-primary/10" : "hover:bg-muted"
					}`}
					onClick={() => onItemClick?.(item)}
					onKeyDown={(e) => handleKeyDown(e, item)}
				>
					<UserAvatar user={item.user} compact />
					<span className="text-sm font-medium">{item.title}</span>
				</button>
			))}
		</div>
	);
}

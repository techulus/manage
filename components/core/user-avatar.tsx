import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
	user?: {
		firstName?: string | null;
		name?: string | null;
		email?: string | null;
		id?: string | null;
	} | null;
	className?: string;
	compact?: boolean;
};

function getAvatarUrl(seed: string) {
	return `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(seed)}`;
}

export const UserAvatar = ({
	user,
	className,
	compact = false,
}: UserAvatarProps) => {
	const seed =
		user?.id || user?.email || user?.firstName || user?.name || "default";
	const fallbackText = user?.firstName?.[0] || user?.name?.[0] || "U";

	return (
		<Avatar className={cn(compact ? "h-5 w-5" : "h-7 w-7", className)}>
			<AvatarImage src={getAvatarUrl(seed)} />
			<AvatarFallback>{fallbackText}</AvatarFallback>
		</Avatar>
	);
};

import { UserAvatar } from "@/components/core/user-avatar";
import type { User } from "@/drizzle/types";
import { cn } from "@/lib/utils";

export function UserBadge({
	className,
	user,
	imageOnly = false,
}: {
	className?: string;
	user: Pick<User, "firstName" | "image">;
	imageOnly?: boolean;
}) {
	return (
		<div className={cn("flex items-center", className)}>
			<UserAvatar className="h-5 w-5" user={user} />
			{!imageOnly ? <p className="ml-2">{user?.firstName}</p> : null}
		</div>
	);
}

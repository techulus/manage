import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/drizzle/types";
import { cn } from "@/lib/utils";

export const UserAvatar = ({
	user,
	className,
	compact = false,
}: {
	user: Pick<User, "firstName" | "imageUrl">;
	className?: string;
	compact?: boolean;
}) => {
	return (
		<Avatar className={cn(compact ? "h-5 w-5" : "h-7 w-7", className)}>
			<AvatarImage
				src={
					user.imageUrl ??
					`https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=${user.firstName}`
				}
			/>
			<AvatarFallback>{user.firstName ?? "User"}</AvatarFallback>
		</Avatar>
	);
};

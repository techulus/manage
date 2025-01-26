import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/drizzle/types";
import { cn } from "@/lib/utils";

export const UserAvatar = ({
	user,
	className,
}: {
	user: Pick<User, "firstName" | "imageUrl">;
	className?: string;
}) => {
	return (
		<Avatar className={cn("h-8 w-8", className)}>
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

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/drizzle/types";

export const UserAvatar = ({
	user,
	className,
}: {
	user: Pick<User, "firstName" | "imageUrl">;
	className?: string;
}) => {
	return (
		<Avatar className={className}>
			<AvatarImage
				src={
					user.imageUrl ??
					`https://api.dicebear.com/9.x/fun-emoji/svg?seed=${user.firstName}`
				}
			/>
			<AvatarFallback>{user.firstName ?? "User"}</AvatarFallback>
		</Avatar>
	);
};

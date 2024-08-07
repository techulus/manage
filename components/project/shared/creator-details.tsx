import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/drizzle/types";

export const CreatorDetails = ({
	user,
	updatedAt,
}: {
	user: Pick<User, "firstName" | "imageUrl">;
	updatedAt: Date;
}) => {
	return (
		<div className="mt-auto flex items-center text-sm text-muted-foreground">
			{user?.imageUrl ? (
				<Avatar>
					<AvatarImage src={user.imageUrl} />
					<AvatarFallback>{user.firstName ?? "User"}</AvatarFallback>
				</Avatar>
			) : null}

			<p className="ml-2">
				Last updated{" "}
				{updatedAt.toLocaleString(undefined, {
					weekday: "short",
					year: "numeric",
					month: "long",
					day: "numeric",
				})}
			</p>
		</div>
	);
};

import { UserAvatar } from "@/components/core/user-avatar";
import type { User } from "@/drizzle/types";

export const CreatorDetails = ({
	user,
	updatedAt,
}: {
	user: Pick<User, "firstName" | "image">;
	updatedAt: Date;
}) => {
	return (
		<div className="mt-auto flex items-center text-sm text-muted-foreground">
			{user ? <UserAvatar user={user} /> : null}

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

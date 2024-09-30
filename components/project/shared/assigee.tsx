import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/drizzle/types";
import { cn } from "@/lib/utils";

export function Assignee({
  className,
  user,
  imageOnly = false,
}: {
  className?: string;
  user: Pick<User, "firstName" | "imageUrl">;
  imageOnly?: boolean;
}) {
  return (
    <div className={cn("flex items-center", className)}>
      {user?.imageUrl ? (
        <Avatar className="h-5 w-5">
          <AvatarImage src={user.imageUrl} />
          <AvatarFallback>{user.firstName}</AvatarFallback>
        </Avatar>
      ) : null}
      {!imageOnly ? <p className="ml-2">{user?.firstName}</p> : null}
    </div>
  );
}

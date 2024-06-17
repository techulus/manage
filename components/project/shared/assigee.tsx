import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/drizzle/types";
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
        <Avatar>
          <AvatarImage src={user.imageUrl} />
          <AvatarFallback>{user.firstName}</AvatarFallback>
        </Avatar>
      ) : null}
      {!imageOnly ? <p className="ml-2">{user?.firstName}</p> : null}
    </div>
  );
}

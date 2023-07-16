import { User } from "@/drizzle/types";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
        <Image
          src={user?.imageUrl}
          alt={user?.firstName ?? ""}
          width={24}
          height={24}
          className="rounded-full"
        />
      ) : null}
      {!imageOnly ? <p className="ml-2">{user?.firstName}</p> : null}
    </div>
  );
}

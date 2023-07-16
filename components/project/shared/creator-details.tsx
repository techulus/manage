import { User } from "@/drizzle/types";
import Image from "next/image";

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
        <Image
          src={user?.imageUrl}
          alt={user?.firstName ?? ""}
          width={24}
          height={24}
          className="rounded-full"
        />
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

import { cn } from "@/lib/utils";
import { convertMarkdownToPlainText } from "@/lib/utils/useMarkdown";
import { ProjectWithUser } from "@/lib/utils/useProjects";
import Image from "next/image";

export const ProjecItem = ({
  project: { id, name, description, user },
}: {
  project: ProjectWithUser;
}) => {
  return (
    <div
      key={id}
      className={cn(
        "group relative bg-white dark:bg-black p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-teal-500"
      )}
    >
      <div>
        <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-50">
          <a href={`/console/projects/${id}`} className="focus:outline-none">
            <span className="absolute inset-0" aria-hidden="true" />
            {name}
          </a>
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-200 line-clamp-3">
          {convertMarkdownToPlainText(description)}
        </p>
      </div>
      <span
        className="pointer-events-none absolute right-6 top-6 text-gray-300 group-hover:text-gray-400"
        aria-hidden="true"
      >
        {user.imageUrl ? (
          <Image
            src={user?.imageUrl}
            alt={user?.firstName ?? user?.email}
            width={24}
            height={24}
            className="rounded-full"
          />
        ) : null}
      </span>
    </div>
  );
};

import { ProjectWithCreator } from "@/drizzle/types";
import { cn } from "@/lib/utils";
import { convertMarkdownToPlainText } from "@/lib/utils/useMarkdown";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "../ui/badge";

export const ProjecItem = ({
  project: { id, name, description, creator, dueDate },
}: {
  project: ProjectWithCreator;
}) => {
  return (
    <div
      key={id}
      className={cn(
        "relative flex space-x-3 rounded-lg border border-gray-200 px-6 py-5 shadow-sm hover:border-gray-400 dark:border-gray-800 dark:hover:border-gray-700"
      )}
    >
      <div>
        <h3 className="text-xl font-semibold leading-6 tracking-tight text-gray-900 dark:text-gray-50">
          <Link href={`/console/projects/${id}`} className="focus:outline-none">
            <span className="absolute inset-0" aria-hidden="true" />
            {name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-gray-500 dark:text-gray-200">
          {convertMarkdownToPlainText(description)}
        </p>
        {dueDate ? (
          <Badge className="mt-2" variant="outline">
            Due {dueDate.toLocaleDateString()}
          </Badge>
        ) : null}
      </div>
      <span
        className="pointer-events-none absolute right-6 top-6 text-gray-300 group-hover:text-gray-400"
        aria-hidden="true"
      >
        {creator.imageUrl ? (
          <Image
            src={creator?.imageUrl}
            alt={creator?.firstName ?? creator?.email}
            width={24}
            height={24}
            className="rounded-full"
          />
        ) : null}
      </span>
    </div>
  );
};

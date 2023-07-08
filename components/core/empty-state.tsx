import Link from "next/link";

export default function EmptyState({
  label,
  show,
  isSearchResult = false,
}: {
  label: string;
  isSearchResult?: boolean;
  show: boolean;
}) {
  return show ? (
    <div className="p-1">
      <Link
        href="/console/projects/new"
        className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center hover:border-gray-400 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
      >
        <svg
          className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6"
          />
        </svg>
        {isSearchResult ? (
          <span className="mt-4 block text-sm font-semibold text-gray-900 dark:text-gray-300">
            We couldn&apos;t find any {label} matching your search
          </span>
        ) : null}
        <span className="mt-2 block text-sm font-semibold text-gray-900 dark:text-gray-300">
          Create new {label}
        </span>
      </Link>
    </div>
  ) : null;
}

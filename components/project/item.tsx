import { Project } from "@prisma/client";
import classNames from "classnames";

export const ProjecItem = ({ id, name, description }: Project) => {
  return (
    <div
      key={id}
      className={classNames(
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
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-200">
          {description}
        </p>
      </div>
      <span
        className="pointer-events-none absolute right-6 top-6 text-gray-300 group-hover:text-gray-400"
        aria-hidden="true"
      >
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
        </svg>
      </span>
    </div>
  );
};

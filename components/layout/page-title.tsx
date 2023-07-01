import { SignedIn } from "@clerk/nextjs";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import classNames from "classnames";
import Link from "next/link";
import { buttonVariants } from "../ui/button";

interface Props {
  title: string;
  actionLink?: string;
  actionLabel?: string;
  backUrl?: string;
}

export default function PageTitle({
  title,
  backUrl,
  actionLink,
  actionLabel,
}: Props) {
  return (
    <div className="relative flex justify-center border-b border-gray-200 dark:border-gray-800 pb-4 pl-4 pr-6 pt-4 sm:pl-6 lg:pl-8 xl:border-t-0 xl:px-8 xl:py-12 dark:text-white">
      <div
        className="absolute inset-0 -z-10 overflow-hidden dark:opacity-50"
        aria-hidden="true"
      >
        <div className="absolute left-16 top-full -mt-16 transform-gpu opacity-50 blur-3xl xl:left-1/2 xl:-ml-80">
          <div
            className="aspect-[1154/678] w-[72.125rem] bg-gradient-to-br from-[#99f6e4] to-[#2dd4bf]"
            style={{
              clipPath:
                "polygon(100% 38.5%, 82.6% 100%, 60.2% 37.7%, 52.4% 32.1%, 47.5% 41.8%, 45.2% 65.6%, 27.5% 23.4%, 0.1% 35.3%, 17.9% 0%, 27.7% 23.4%, 76.2% 2.5%, 74.2% 56%, 100% 38.5%)",
            }}
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gray-900/5" />
      </div>

      <div className="flex w-full justify-between max-w-5xl">
        <div className="flex items-center">
          {backUrl && (
            <SignedIn>
              <Link
                href={backUrl}
                className="flex items-center text-md font-medium text-gray-600 hover:text-gray-900 mr-2"
              >
                <ArrowLeftIcon
                  className={classNames(
                    "flex-shrink-0 h-6 w-6 text-gray-600 hover:text-gray-900",
                    "dark:text-gray-400 dark:hover:text-gray-300"
                  )}
                  aria-hidden="true"
                />
              </Link>
            </SignedIn>
          )}

          <h1 className="flex-1 text-2xl">{title}</h1>
        </div>

        {actionLink && actionLabel ? (
          <Link href={actionLink} className={buttonVariants()}>
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

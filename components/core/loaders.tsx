import { cn } from "@/lib/utils";
import { CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { ContentBlock } from "./content-block";

export function Spinner({
  message = null,
  className = "",
}: {
  message?: string | null;
  className?: string;
}) {
  return (
    <div className="flex items-center justify-center">
      <svg
        className={cn("h-5 w-5 animate-spin text-black", className)}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {message && <p className="ml-3">{message}</p>}
    </div>
  );
}

export function SpinnerWithSpacing() {
  return (
    <div className="relative flex h-48 items-center justify-center py-5 pl-4 pr-4 sm:py-6 sm:pl-6 lg:pl-8 xl:pl-6">
      <Spinner />
    </div>
  );
}

export function PageLoading() {
  return (
    <>
      <div className="flex h-[120px] justify-center border-b bg-gray-50 pb-4 pl-4 pr-6 pt-4 dark:bg-card dark:bg-gray-900 dark:text-white sm:pl-6 lg:pl-8 xl:border-t-0 xl:px-8 xl:py-10">
        <div className="flex w-full max-w-5xl flex-col space-y-2">
          <Skeleton className="h-[20px] w-[300px] rounded-md" />
          <Skeleton className="h-[20px] w-[300px] rounded-md" />
        </div>
      </div>

      <div className="h-8"></div>

      <ContentBlock>
        <CardContent>
          <div className="flex flex-col space-y-2 pt-6">
            <Skeleton className="h-[28px] w-full rounded-md" />
            <Skeleton className="h-[28px] w-full rounded-md" />
            <Skeleton className="h-[28px] w-[124px] rounded-md" />
          </div>
        </CardContent>
      </ContentBlock>

      <ContentBlock>
        <CardContent>
          <div className="flex flex-col space-y-2 pt-6">
            <Skeleton className="h-[28px] w-full rounded-md" />
            <Skeleton className="h-[28px] w-full rounded-md" />
            <Skeleton className="h-[28px] w-[124px] rounded-md" />
          </div>
        </CardContent>
      </ContentBlock>
    </>
  );
}

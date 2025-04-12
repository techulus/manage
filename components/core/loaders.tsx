import { cn } from "@/lib/utils";
import PageTitle from "../layout/page-title";
import { Skeleton } from "../ui/skeleton";
import PageSection from "./section";

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
				className={cn("h-5 w-5 animate-spin text-primary", className)}
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
				/>
				<path
					className="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				/>
			</svg>
			{message && <p className="ml-3">{message}</p>}
		</div>
	);
}

export function SpinnerWithSpacing() {
	return (
		<div className="relative flex h-48 items-center justify-center py-3 pl-4 pr-4 sm:pl-6 lg:pl-8 xl:pl-6">
			<Spinner />
		</div>
	);
}

export function PageLoading() {
	return (
		<>
			<PageTitle title="">
				<div className="flex w-full max-w-7xl flex-col justify-center space-y-2">
					<Skeleton className="h-[20px] w-[300px] rounded-md bg-muted-foreground/20" />
					<Skeleton className="h-[20px] w-[300px] rounded-md bg-muted-foreground/20" />
				</div>
			</PageTitle>

			<PageSection bottomMargin>
				<div className="flex flex-col space-y-2 p-4">
					<Skeleton className="h-[20px] w-full rounded-md bg-muted-foreground/20" />
					<Skeleton className="h-[20px] w-full rounded-md bg-muted-foreground/20" />
					<Skeleton className="h-[20px] w-[124px] rounded-md bg-muted-foreground/20" />
				</div>
			</PageSection>

			<PageSection>
				<div className="flex flex-col space-y-2 p-4">
					<Skeleton className="h-[20px] w-full rounded-md bg-muted-foreground/20" />
					<Skeleton className="h-[20px] w-full rounded-md bg-muted-foreground/20" />
					<Skeleton className="h-[20px] w-[124px] rounded-md bg-muted-foreground/20" />
				</div>
			</PageSection>
		</>
	);
}

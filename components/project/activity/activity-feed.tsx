"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ActivityIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import Markdown from "react-markdown";
import { Spinner, SpinnerWithSpacing } from "@/components/core/loaders";
import { Button } from "@/components/ui/button";
import type { ActivityWithActor } from "@/drizzle/types";
import { generateObjectDiffMessage } from "@/lib/activity/message";
import { guessTimezone, toDateTimeString } from "@/lib/utils/date";
import { useTRPCClient } from "@/trpc/client";

const ACTIVITIES_LIMIT = 25;

function getActionConfig(action: string) {
	switch (action) {
		case "created":
			return {
				label: "Created",
				bgColor: "bg-emerald-100 dark:bg-emerald-900/50",
				textColor: "text-emerald-600 dark:text-emerald-400",
			};
		case "updated":
			return {
				label: "Updated",
				bgColor: "bg-blue-100 dark:bg-blue-900/50",
				textColor: "text-blue-600 dark:text-blue-400",
			};
		case "deleted":
			return {
				label: "Deleted",
				bgColor: "bg-red-100 dark:bg-red-900/50",
				textColor: "text-red-600 dark:text-red-400",
			};
		default:
			return {
				label: action,
				bgColor: "bg-muted",
				textColor: "text-muted-foreground",
			};
	}
}

export function ActivityItem({ item }: { item: ActivityWithActor }) {
	const actionConfig = getActionConfig(item.action);

	return (
		<div className="py-4 px-4 hover:bg-muted/30 rounded-lg transition-colors">
			<div className="space-y-1 text-center">
				<div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
					<span className="font-semibold text-foreground">
						{item.actor.firstName}
					</span>
					<span
						className={`text-xs font-medium px-2 py-0.5 rounded ${actionConfig.bgColor} ${actionConfig.textColor}`}
					>
						{actionConfig.label}
					</span>
					<span
						className="text-xs text-muted-foreground"
						title={toDateTimeString(item.createdAt, guessTimezone)}
					>
						{formatDistanceToNow(new Date(item.createdAt), {
							addSuffix: true,
						})}
					</span>
				</div>

				<div className="text-sm text-muted-foreground">
					<Markdown
						components={{
							p: ({ children }) => (
								<p className="leading-relaxed">{children}</p>
							),
							strong: ({ children }) => (
								<strong className="font-semibold text-foreground">
									{children}
								</strong>
							),
							ul: ({ children }) => (
								<ul className="mt-2 space-y-1 text-sm">{children}</ul>
							),
							li: ({ children }) => (
								<li className="flex items-center justify-center gap-2">
									<span className="text-primary h-1.5 w-1.5 rounded-full bg-current flex-shrink-0" />
									<span>{children}</span>
								</li>
							),
						}}
					>
						{generateObjectDiffMessage(item)}
					</Markdown>
				</div>
			</div>
		</div>
	);
}

export function ActivityFeed() {
	const { projectId } = useParams();
	const trpcClient = useTRPCClient();

	const {
		data: activitiesData,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isPending,
	} = useInfiniteQuery({
		queryKey: ["projects", "getActivities", +projectId!],
		queryFn: async ({ pageParam }) => {
			return await trpcClient.projects.getActivities.query({
				projectId: +projectId!,
				offset: pageParam,
			});
		},
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) => {
			if (lastPage.length < ACTIVITIES_LIMIT) return undefined;
			return allPages.length * ACTIVITIES_LIMIT;
		},
	});

	const activities = useMemo(() => {
		return activitiesData?.pages.flat() ?? [];
	}, [activitiesData]);

	if (isPending) {
		return <SpinnerWithSpacing />;
	}

	return (
		<div className="flex flex-col w-full max-w-2xl mx-auto">
			{activities.length ? (
				<>
					<div>
						{activities.map((activityItem, index) => (
							<div key={activityItem.id}>
								<ActivityItem item={activityItem} />
								{index < activities.length - 1 && (
									<div className="flex justify-center py-2">
										<div className="w-24 h-px bg-border" />
									</div>
								)}
							</div>
						))}
					</div>

					<div className="flex justify-center p-4 mt-2">
						{isFetchingNextPage ? (
							<Spinner className="mx-auto" />
						) : hasNextPage ? (
							<Button
								onClick={() => fetchNextPage()}
								variant="outline"
								size="sm"
								className="w-full max-w-xs"
							>
								Load more activities
							</Button>
						) : (
							<span className="text-xs text-muted-foreground">
								End of activity
							</span>
						)}
					</div>
				</>
			) : (
				<div className="flex flex-col items-center justify-center py-16 px-4 text-center">
					<div className="rounded-full bg-muted p-4">
						<ActivityIcon className="h-8 w-8 text-muted-foreground" />
					</div>
					<h3 className="mt-4 font-semibold text-foreground">
						No activity yet
					</h3>
					<p className="mt-1 text-sm text-muted-foreground max-w-xs">
						Activity will appear here as you and your team make changes to this
						project.
					</p>
				</div>
			)}
		</div>
	);
}

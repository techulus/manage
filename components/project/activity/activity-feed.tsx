"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
	format,
	formatDistanceToNow,
	isThisMonth,
	isThisWeek,
	isToday,
	isYesterday,
} from "date-fns";
import {
	ActivityIcon,
	PencilIcon,
	PlusCircleIcon,
	TrashIcon,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import Markdown from "react-markdown";
import { Spinner, SpinnerWithSpacing } from "@/components/core/loaders";
import { UserAvatar } from "@/components/core/user-avatar";
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
				icon: PlusCircleIcon,
				bgColor: "bg-emerald-100 dark:bg-emerald-900/50",
				iconColor: "text-emerald-600 dark:text-emerald-400",
				borderColor: "border-emerald-200 dark:border-emerald-800",
			};
		case "updated":
			return {
				label: "Updated",
				icon: PencilIcon,
				bgColor: "bg-blue-100 dark:bg-blue-900/50",
				iconColor: "text-blue-600 dark:text-blue-400",
				borderColor: "border-blue-200 dark:border-blue-800",
			};
		case "deleted":
			return {
				label: "Deleted",
				icon: TrashIcon,
				bgColor: "bg-red-100 dark:bg-red-900/50",
				iconColor: "text-red-600 dark:text-red-400",
				borderColor: "border-red-200 dark:border-red-800",
			};
		default:
			return {
				label: action,
				icon: ActivityIcon,
				bgColor: "bg-muted",
				iconColor: "text-muted-foreground",
				borderColor: "border-border",
			};
	}
}

function getDateGroup(date: Date): string {
	if (isToday(date)) return "Today";
	if (isYesterday(date)) return "Yesterday";
	if (isThisWeek(date)) return "This Week";
	if (isThisMonth(date)) return "This Month";
	return format(date, "MMMM yyyy");
}

export function ActivityItem({ item }: { item: ActivityWithActor }) {
	const actionConfig = getActionConfig(item.action);
	const ActionIcon = actionConfig.icon;

	return (
		<div className="group relative flex gap-4 py-4 px-4 hover:bg-muted/30 rounded-lg transition-colors">
			<div className="flex-shrink-0 relative">
				{item.actor ? (
					<UserAvatar
						user={item.actor}
						className="h-10 w-10 ring-2 ring-background shadow-sm"
					/>
				) : null}
				<div
					className={`absolute -bottom-1 -right-1 rounded-full p-1.5 ${actionConfig.bgColor} border ${actionConfig.borderColor}`}
				>
					<ActionIcon className={`h-3 w-3 ${actionConfig.iconColor}`} />
				</div>
			</div>

			<div className="flex-1 min-w-0 space-y-1">
				<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
					<span className="font-semibold text-foreground">
						{item.actor.firstName}
					</span>
					<span
						className={`text-xs font-medium px-2 py-0.5 rounded ${actionConfig.bgColor} ${actionConfig.iconColor}`}
					>
						{actionConfig.label}
					</span>
					<span
						className="text-xs text-muted-foreground ml-auto"
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
								<li className="flex items-start gap-2">
									<span className="text-primary mt-1.5 h-1.5 w-1.5 rounded-full bg-current flex-shrink-0" />
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

function DateGroupHeader({ label }: { label: string }) {
	return (
		<div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 px-4 border-b border-border/50">
			<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
				{label}
			</span>
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

	const groupedActivities = useMemo(() => {
		const activities = activitiesData?.pages.flat() ?? [];
		const groups: { label: string; items: ActivityWithActor[] }[] = [];
		let currentGroup: string | null = null;

		for (const activity of activities) {
			const group = getDateGroup(new Date(activity.createdAt));
			if (group !== currentGroup) {
				groups.push({ label: group, items: [activity] });
				currentGroup = group;
			} else {
				groups[groups.length - 1].items.push(activity);
			}
		}
		return groups;
	}, [activitiesData]);

	if (isPending) {
		return <SpinnerWithSpacing />;
	}

	return (
		<div className="flex flex-col w-full">
			{groupedActivities.length ? (
				<>
					<div className="divide-y divide-border/30">
						{groupedActivities.map((group) => (
							<div key={group.label}>
								<DateGroupHeader label={group.label} />
								<div className="divide-y divide-border/20">
									{group.items.map((activityItem) => (
										<ActivityItem key={activityItem.id} item={activityItem} />
									))}
								</div>
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

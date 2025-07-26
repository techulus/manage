"use client";

import { Spinner, SpinnerWithSpacing } from "@/components/core/loaders";
import { UserAvatar } from "@/components/core/user-avatar";
import { Button } from "@/components/ui/button";
import type { ActivityWithActor } from "@/drizzle/types";
import { generateObjectDiffMessage } from "@/lib/activity/message";
import { guessTimezone, toDateTimeString } from "@/lib/utils/date";
import { formatDistanceToNow } from "date-fns";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { PencilIcon, PlusCircleIcon, TrashIcon, ActivityIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";

export function ActivityItem({
	item,
	isLast,
}: { item: ActivityWithActor; isLast: boolean }) {
	return (
		<li key={item.id} className="group hover:bg-muted/40 transition-all duration-200 rounded-lg border border-transparent hover:border-border/50 hover:shadow-sm">
			<div className="relative px-4 py-3">
				{!isLast ? (
					<span
						className="absolute left-[2.125rem] top-12 h-[calc(100%-1.5rem)] w-[2px] bg-gradient-to-b from-border to-transparent"
						aria-hidden="true"
					/>
				) : null}
				<div className="relative flex items-start space-x-3">
					<div className="relative">
						{item.actor ? (
							<div className="h-8 w-8">
								<UserAvatar
									user={item.actor}
									className="ring-2 ring-background shadow-md group-hover:ring-4 transition-all duration-200"
								/>
							</div>
						) : null}

						<div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-background shadow-lg border border-border/50 p-1">
							{item.action === "created" ? (
								<div className="rounded-full bg-emerald-50 dark:bg-emerald-950 p-0.5">
									<PlusCircleIcon
										className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400"
										aria-hidden="true"
									/>
								</div>
							) : null}
							{item.action === "updated" ? (
								<div className="rounded-full bg-blue-50 dark:bg-blue-950 p-0.5">
									<PencilIcon
										className="h-2.5 w-2.5 text-blue-600 dark:text-blue-400"
										aria-hidden="true"
									/>
								</div>
							) : null}
							{item.action === "deleted" ? (
								<div className="rounded-full bg-red-50 dark:bg-red-950 p-0.5">
									<TrashIcon
										className="h-2.5 w-2.5 text-red-600 dark:text-red-400"
										aria-hidden="true"
									/>
								</div>
							) : null}
						</div>
					</div>
					<div className="min-w-0 flex-1">
						<div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
							<span className="font-medium text-foreground text-sm">
								{item.actor.firstName}
							</span>
							<span className="text-muted-foreground text-xs font-medium bg-muted/50 px-1.5 py-0.5 rounded-full w-fit" title={toDateTimeString(item.createdAt, guessTimezone)}>
								{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
							</span>
						</div>
						<div className="mt-1 prose dark:prose-invert max-w-none prose-sm text-sm leading-relaxed">
							<Markdown 
								components={{
									p: ({ children }) => <p className="mb-1.5 last:mb-0 text-muted-foreground leading-relaxed">{children}</p>,
									strong: ({ children }) => <strong className="font-semibold text-foreground bg-muted/30 px-1 py-0.5 rounded">{children}</strong>,
									ul: ({ children }) => <ul className="ml-4 mt-1 space-y-1">{children}</ul>,
									li: ({ children }) => <li className="text-muted-foreground before:content-['•'] before:text-primary before:font-bold before:-ml-4 before:mr-2">{children}</li>
								}}
							>
								{generateObjectDiffMessage(item)}
							</Markdown>
						</div>
					</div>
				</div>
			</div>
		</li>
	);
}

export function ActivityFeed() {
	const { projectId } = useParams();
	const [hasMore, setHasMore] = useState(true);
	const [offset, setOffset] = useState(0);
	const [allActivities, setAllActivities] = useState<ActivityWithActor[]>([]);

	const trpc = useTRPC();
	const { data: activities = [], isLoading } = useQuery({
		...trpc.projects.getActivities.queryOptions({
			projectId: +projectId!,
			offset,
		}),
		staleTime: 0,
		gcTime: 0,
	});

	useEffect(() => {
		const existingActivityIds = allActivities.map((activity) => activity.id);
		const newActivities = activities.filter(
			(activity) => !existingActivityIds.includes(activity.id),
		);
		if (newActivities.length > 0) {
			setAllActivities((prev) => [...prev, ...newActivities]);
			setHasMore(newActivities.length === 25);
		} else {
			setHasMore(false);
		}
	}, [activities, allActivities]);

	const loadMore = () => {
		setOffset((prev) => prev + 25);
	};

	if (isLoading && !allActivities.length) {
		return <SpinnerWithSpacing />;
	}

	return (
		<div className="flex flex-col w-full">
			{allActivities.length ? (
				<>
					<ul className="w-full space-y-1">
						{allActivities.map((activityItem, activityItemIdx) => (
							<ActivityItem
								key={activityItem.id}
								item={activityItem}
								isLast={activityItemIdx === allActivities.length - 1}
							/>
						))}
					</ul>
					{!isLoading ? (
						<div className="flex justify-center p-4 border-t border-border/50 mt-2">
							{hasMore ? (
								<Button
									onClick={loadMore}
									variant="outline"
									size="sm"
									className="w-full max-w-xs shadow-sm hover:shadow-md transition-shadow duration-200"
								>
									Load more activities
								</Button>
							) : (
								<div className="flex items-center gap-2 text-muted-foreground text-sm">
									<div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
									<span>You've reached the end</span>
									<div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
								</div>
							)}
						</div>
					) : null}
					{isLoading ? <div className="flex justify-center py-4"><Spinner className="mx-auto" /></div> : null}
				</>
			) : (
				<div className="flex flex-col items-center justify-center py-12 px-4 text-center">
					<div className="rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 p-4 shadow-sm border border-border/30">
						<ActivityIcon className="h-6 w-6 text-muted-foreground/60 mx-auto" />
					</div>
					<div className="mt-4 space-y-1">
						<h3 className="font-medium text-foreground">No activity yet</h3>
						<p className="text-sm text-muted-foreground max-w-sm">
							Project activity will appear here as you and your team make changes
						</p>
					</div>
				</div>
			)}
		</div>
	);
}

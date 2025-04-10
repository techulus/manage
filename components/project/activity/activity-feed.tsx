"use client";

import { Spinner, SpinnerWithSpacing } from "@/components/core/loaders";
import { UserAvatar } from "@/components/core/user-avatar";
import { Button } from "@/components/ui/button";
import type { ActivityWithActor } from "@/drizzle/types";
import { generateObjectDiffMessage } from "@/lib/activity/message";
import { guessTimezone, toDateTimeString } from "@/lib/utils/date";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { PencilIcon, PlusCircleIcon, TrashIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export function ActivityItem({
	item,
	isLast,
}: { item: ActivityWithActor; isLast: boolean }) {
	return (
		<li key={item.id} className="hover:bg-muted/50 transition-colors">
			<div className="relative px-4 pt-4">
				{!isLast ? (
					<span
						className="absolute left-[2.25rem] top-12 -ml-px h-[calc(100%-2rem)] w-[2px] bg-border"
						aria-hidden="true"
					/>
				) : null}
				<div className="relative flex items-start space-x-4">
					<div className="relative">
						{item.actor ? (
							<div className="h-9 w-9">
								<UserAvatar
									user={item.actor}
									className="ring-2 ring-background"
								/>
							</div>
						) : null}

						<div className="absolute -bottom-1 -right-2 rounded-full bg-background shadow-sm p-1">
							{item.action === "created" ? (
								<div className="rounded-full border border-border bg-card p-[2px]">
									<PlusCircleIcon
										className="h-[14px] w-[14px] text-emerald-500"
										aria-hidden="true"
									/>
								</div>
							) : null}
							{item.action === "updated" ? (
								<div className="rounded-full border border-border bg-card p-[2px]">
									<PencilIcon
										className="h-[14px] w-[14px] text-blue-500"
										aria-hidden="true"
									/>
								</div>
							) : null}
							{item.action === "deleted" ? (
								<div className="rounded-full border border-border bg-card p-[2px]">
									<TrashIcon
										className="h-[14px] w-[14px] text-red-500"
										aria-hidden="true"
									/>
								</div>
							) : null}
						</div>
					</div>
					<div className="min-w-0 flex-1">
						<div className="flex flex-col text-sm sm:flex-row sm:items-center sm:gap-2">
							<a
								href={item.actor.id}
								className="font-medium text-primary hover:underline"
							>
								{item.actor.firstName}
							</a>
							<span className="text-muted-foreground text-xs">
								{toDateTimeString(item.createdAt, guessTimezone)}
							</span>
						</div>
						{item.oldValue && item.newValue ? (
							<div className="mt-1">
								{generateObjectDiffMessage(item.oldValue, item.newValue)}
							</div>
						) : null}
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
	const { data: activities = [], isLoading } = useQuery(
		trpc.projects.getActivities.queryOptions({
			projectId: +projectId!,
			offset,
		}),
	);

	useEffect(() => {
		if (activities.length > 0) {
			setAllActivities((prev) => [...prev, ...activities]);
			setHasMore(activities.length === 25);
		} else {
			setHasMore(false);
		}
	}, [activities]);

	const loadMore = () => {
		setOffset((prev) => prev + 25);
	};

	if (isLoading && !allActivities.length) {
		return <SpinnerWithSpacing />;
	}

	return (
		<div className="flex flex-col w-full rounded-lg border bg-card">
			{allActivities.length ? (
				<>
					<ul className="w-full">
						{allActivities.map((activityItem, activityItemIdx) => (
							<ActivityItem
								key={activityItem.id}
								item={activityItem}
								isLast={activityItemIdx === allActivities.length - 1}
							/>
						))}
					</ul>
					{hasMore && !isLoading ? (
						<div className="flex justify-center p-4 border-t">
							<Button
								onClick={loadMore}
								variant="outline"
								size="sm"
								className="w-full max-w-xs"
							>
								Load more
							</Button>
						</div>
					) : null}
					{isLoading ? <Spinner className="mx-auto" /> : null}
				</>
			) : (
				<div className="flex flex-col items-center justify-center py-8 px-4 text-center">
					<div className="rounded-full bg-muted/50 p-3">
						<PlusCircleIcon className="h-5 w-5 text-muted-foreground" />
					</div>
					<p className="mt-2 text-sm text-muted-foreground">
						No activity found
					</p>
				</div>
			)}
		</div>
	);
}

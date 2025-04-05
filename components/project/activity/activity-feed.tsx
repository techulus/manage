"use client";

import { fetchActivities } from "@/app/(dashboard)/[tenant]/projects/actions";
import { Spinner } from "@/components/core/loaders";
import { MarkdownView } from "@/components/core/markdown-view";
import { UserAvatar } from "@/components/core/user-avatar";
import { Button } from "@/components/ui/button";
import type { ActivityWithActor } from "@/drizzle/types";
import { guessTimezone, toDateTimeString } from "@/lib/utils/date";
import { PencilIcon, PlusCircleIcon, TrashIcon } from "lucide-react";
import { useCallback, useState } from "react";

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
						{item.message ? (
							<div className="mt-1 prose-sm text-muted-foreground">
								<MarkdownView content={item.message} />
							</div>
						) : null}
					</div>
				</div>
			</div>
		</li>
	);
}

export function ActivityFeed({
	activities,
	projectId,
}: { activities: ActivityWithActor[]; projectId: string }) {
	const [hasMore, setHasMore] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [initialActivities, setInitialActivities] =
		useState<ActivityWithActor[]>(activities);

	const loadMore = useCallback(async () => {
		setIsLoading(true);
		const activities = await fetchActivities(
			projectId,
			initialActivities.length,
		);
		setInitialActivities([...initialActivities, ...activities]);
		setHasMore(activities.length === 50);
		setIsLoading(false);
	}, [projectId, initialActivities]);

	return (
		<div className="flex flex-col w-full rounded-lg border bg-card">
			{activities.length ? (
				<>
					<ul className="w-full">
						{initialActivities.map((activityItem, activityItemIdx) => (
							<ActivityItem
								key={activityItem.id}
								item={activityItem}
								isLast={activityItemIdx === initialActivities.length - 1}
							/>
						))}
					</ul>
					<div className="flex justify-center p-4 border-t">
						{hasMore && !isLoading ? (
							<Button
								onClick={loadMore}
								variant="outline"
								size="sm"
								className="w-full max-w-xs"
							>
								Load more
							</Button>
						) : null}
						{isLoading ? <Spinner className="mx-auto" /> : null}
					</div>
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
